import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/NewNavbar'
import io from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { useGamification } from '../components/GamificationSystem'

const PeerChat = () => {
  const { user } = useAuth()
  const { addXP, addAchievement, updateStreak, completeDailyGoal } = useGamification()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [matched, setMatched] = useState(false)
  const [peerName, setPeerName] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [status, setStatus] = useState('Connecting...')
  const [isVoiceCall, setIsVoiceCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [peerAudioEnabled, setPeerAudioEnabled] = useState(false)
  const [incomingCall, setIncomingCall] = useState(false)
  const [outgoingCall, setOutgoingCall] = useState(false)
  const [callRequestFrom, setCallRequestFrom] = useState('')
  const [lastCallRequestId, setLastCallRequestId] = useState('') // Track last request to prevent duplicates
  const [onlineStats, setOnlineStats] = useState({ totalOnline: 0, waiting: 0, inCall: 0, onlineUsersList: [] })
  const [myContacts, setMyContacts] = useState([])
  const [contactRequests, setContactRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const ringtoneRef = useRef(null)
  const gamificationRef = useRef({ addXP, addAchievement, updateStreak, completeDailyGoal });
  
  // Update the ref when gamification functions change
  useEffect(() => {
    gamificationRef.current = { addXP, addAchievement, updateStreak, completeDailyGoal };
  });

  useEffect(() => {
    // Reset all call-related states when component mounts
    setIncomingCall(false)
    setOutgoingCall(false)
    setCallRequestFrom('')
    setIsCallActive(false)
    setIsMuted(false)
    setPeerAudioEnabled(false)
    setLastCallRequestId('') // Reset duplicate prevention
    
    // Stop any playing ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
    
    // Use deployed backend URL for WebSocket connection
    const SOCKET_URL = 'https://backend-railway-2-31ky.onrender.com'
    
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    })

    socketRef.current.on('connect', () => {
      setConnected(true)
      setStatus('Finding a peer...')
      const displayName = user?.username || user?.name || user?.email?.split('@')[0] || 'Anonymous'
      console.log('🔌 Socket connected, joining chat with name:', displayName, 'User object:', user)
      socketRef.current.emit('join-chat', { userName: displayName })
    })

    socketRef.current.on('waiting-for-peer', () => {
      console.log('⏳ Waiting for peer to connect...')
      setStatus('Waiting for someone to connect...')
      setMatched(false)
    })

    socketRef.current.on('peer-matched', (data) => {
      console.log('🤝 Peer matched:', data)
      setPeerName(data.peerName || 'Anonymous')
      setMatched(true)
      setStatus('Connected')
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: `You are now connected with ${data.peerName}. Start practicing English!` }
      ])
      
      // Award XP for getting matched
      gamificationRef.current.addXP(5, 'peer_matched');
      
      // Award achievement for first match
      if (messages.length === 0) {  // First interaction
        gamificationRef.current.addAchievement({
          _id: 'first_match',
          name: 'First Match',
          description: 'Get matched with your first peer',
          icon: '🤝',
          category: 'social'
        });
      }
    })

    // WebRTC signaling events
    socketRef.current.on('voice-call-request', (data) => {
      console.log('🔔 Received voice-call-request:', data);
      
      // Prevent duplicate requests from the same user
      const requestId = `${data.from}-${Date.now()}`;
      if (lastCallRequestId === data.from) {
        console.log('⚠️ Duplicate voice call request ignored from:', data.from);
        return;
      }
      
      setLastCallRequestId(data.from);
      setIncomingCall(true)
      setCallRequestFrom(data.from)
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: `${data.from} wants to start a voice call` }
      ])
      
      // Play ringtone
      if (ringtoneRef.current) {
        console.log('🔊 Playing ringtone');
        ringtoneRef.current.play().catch(err => console.log('Ringtone play failed:', err))
      }
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        console.log('📢 Showing browser notification');
        new Notification('Incoming Voice Call', {
          body: `${data.from} wants to talk with you`,
          icon: '🎤',
          requireInteraction: true
        })
      }
    })

    socketRef.current.on('voice-call-rejected', () => {
      console.log('❌ Voice call rejected')
      setOutgoingCall(false)
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: 'Voice call was rejected' }
      ])
    })

    socketRef.current.on('voice-call-accepted', async () => {
      console.log('✅ Voice call accepted')
      await initiateCall()
    })

    socketRef.current.on('voice-call-offer', async (data) => {
      console.log('📡 Received voice-call-offer:', data)
      await handleReceiveOffer(data)
    })

    socketRef.current.on('voice-call-answer', async (data) => {
      console.log('📡 Received voice-call-answer:', data)
      await handleReceiveAnswer(data)
    })

    socketRef.current.on('ice-candidate', async (data) => {
      console.log('🧊 Received ICE candidate:', data)
      if (peerConnectionRef.current && data.candidate) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
    })

    socketRef.current.on('voice-call-ended', () => {
      console.log('☎️ Voice call ended')
      endVoiceCall()
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: `${peerName} ended the voice call` }
      ])
    })

    socketRef.current.on('message', (data) => {
      console.log('💬 Received message:', data)
      setMessages((prev) => [
        ...prev,
        { type: 'peer', text: data.message, sender: data.sender, timestamp: data.timestamp }
      ])
    })

    socketRef.current.on('peer-typing', (data) => {
      console.log('⌨️ Peer is typing')
      setIsTyping(true)
    })

    socketRef.current.on('peer-stop-typing', () => {
      console.log('⏹️ Peer stopped typing')
      setIsTyping(false)
    })

    socketRef.current.on('peer-disconnected', (data) => {
      console.log('💔 Peer disconnected:', data)
      endVoiceCall()
      setMatched(false)
      setStatus('Peer disconnected')
      // Clear any pending call states when peer disconnects
      setIncomingCall(false)
      setOutgoingCall(false)
      setCallRequestFrom('')
      setLastCallRequestId('') // Reset duplicate prevention
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: `${data.peerName} left the chat. Searching for a new peer...` }
      ])
      // Auto reconnect after 2 seconds
      setTimeout(() => {
        setStatus('Finding a peer...')
        const displayName = user?.username || user?.name || user?.email?.split('@')[0] || 'Anonymous'
        socketRef.current.emit('join-chat', { userName: displayName })
      }, 2000)
    })

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
      setConnected(false)
      setMatched(false)
      setStatus('Disconnected')
      // Clear any pending call states when disconnected
      setIncomingCall(false)
      setOutgoingCall(false)
      setCallRequestFrom('')
      setLastCallRequestId('') // Reset duplicate prevention
      // Stop ringtone if playing
      if (ringtoneRef.current) {
        ringtoneRef.current.pause()
        ringtoneRef.current.currentTime = 0
      }
      
      // Track peer chat time when disconnecting (estimate ~3 minutes for text chat)
      try {
        const token = localStorage.getItem('token');
        if (token && matched) { // Only track if they were actually matched
          axios.post('/api/users/track-peer-session', {
            duration: 3 // 3 minutes for text chat session
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).catch(error => {
            console.error('Failed to track peer session:', error);
          });
        }
      } catch (error) {
        console.error('Error tracking peer session:', error);
      }
    })

    // Online stats
    socketRef.current.on('online-stats', (stats) => {
      console.log('📊 Online stats updated:', stats)
      setOnlineStats(stats)
    })

    return () => {
      endVoiceCall(true) // Pass true to indicate this is cleanup
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [user])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    // Load contacts
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found, skipping contacts load')
        return
      }
      
      console.log('Loading contacts...')
      // Use axios which already has the base URL configured
      const response = await axios.get('/api/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Contacts loaded:', response.data)
      setMyContacts(response.data.contacts || [])
      setContactRequests(response.data.contactRequests || [])
      setSentRequests(response.data.sentRequests || [])
    } catch (error) {
      console.error('Failed to load contacts:', error.response?.data || error.message)
    }
  }

  const sendContactRequest = async (username) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessages(prev => [...prev, { type: 'system', text: 'Please login to send contact requests' }])
        return
      }
      
      console.log('Sending contact request to:', username)
      // Use axios which already has the base URL configured
      const response = await axios.post('/api/contacts/request', 
        { username },
        { headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('Request sent:', response.data)
      setMessages(prev => [...prev, { type: 'system', text: `Contact request sent to ${username}! 📤` }])
      loadContacts() // Reload to update sent requests
    } catch (error) {
      console.error('Send request error:', error.response?.data || error.message)
      const errorMsg = error.response?.data?.message || 'Failed to send request'
      setMessages(prev => [...prev, { type: 'system', text: `Error: ${errorMsg}` }])
    }
  }

  const acceptContactRequest = async (requestId, username) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
    
      // Use axios which already has the base URL configured
      const response = await axios.post(`/api/contacts/accept/${requestId}`, {},
        { headers: { Authorization: `Bearer ${token}` }
      })
      
      setMyContacts(response.data.contacts)
      setContactRequests(response.data.contactRequests)
      setMessages(prev => [...prev, { type: 'system', text: `${username} added to contacts! ✅` }])
    } catch (error) {
      console.error('Accept request error:', error)
      setMessages(prev => [...prev, { type: 'system', text: 'Failed to accept request' }])
    }
  }

  const rejectContactRequest = async (requestId, username) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
    
      // Use axios which already has the base URL configured
      const response = await axios.post(`/api/contacts/reject/${requestId}`, {},
        { headers: { Authorization: `Bearer ${token}` }
      })
      
      setContactRequests(response.data.contactRequests)
      setMessages(prev => [...prev, { type: 'system', text: `Rejected request from ${username}` }])
    } catch (error) {
      console.error('Reject request error:', error)
      setMessages(prev => [...prev, { type: 'system', text: 'Failed to reject request' }])
    }
  }

  const isInContacts = (username) => {
    return myContacts.some(c => c.username === username)
  }

  const hasSentRequest = (username) => {
    return sentRequests.some(r => r.toUsername === username)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = () => {
    if (matched && socketRef.current) {
      socketRef.current.emit('typing')
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop-typing')
      }, 1000)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || !connected || !matched) return

    const message = input.trim()
    setMessages((prev) => [...prev, { type: 'me', text: message, timestamp: new Date() }])

    if (socketRef.current) {
      socketRef.current.emit('message', { message })
      socketRef.current.emit('stop-typing')
    }

    // Award XP for sending messages
    gamificationRef.current.addXP(2, 'chat_message_sent');
    
    // Complete daily goal
    gamificationRef.current.completeDailyGoal();
    
    setInput('')
  }

  // Voice call functions
  const requestVoiceCall = () => {
    if (socketRef.current) {
      console.log('📞 Requesting voice call to:', peerName);
      setOutgoingCall(true)
      socketRef.current.emit('voice-call-request', { to: peerName })
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: 'Calling... waiting for response' }
      ])
    }
  }

  const acceptVoiceCall = async () => {
    console.log('✅ Accepting voice call from:', callRequestFrom);
    setIncomingCall(false)
    setLastCallRequestId('') // Reset duplicate prevention
    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
    if (socketRef.current) {
      socketRef.current.emit('voice-call-accepted')
    }
    setMessages((prev) => [
      ...prev,
      { type: 'system', text: 'Call accepted. Connecting...' }
    ])
    // Wait for the initiator to send the offer
  }

  const rejectVoiceCall = () => {
    console.log('❌ Rejecting voice call from:', callRequestFrom);
    setIncomingCall(false)
    setCallRequestFrom('')
    setLastCallRequestId('') // Reset duplicate prevention
    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
    if (socketRef.current) {
      socketRef.current.emit('voice-call-rejected')
    }
    setMessages((prev) => [
      ...prev,
      { type: 'system', text: 'Voice call rejected' }
    ])
  }

  const initiateCall = async () => {
    try {
      setOutgoingCall(false)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      setIsCallActive(true)
      setMessages((prev) => [...prev, { type: 'system', text: 'Starting voice call...' }])

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      peerConnectionRef.current = pc

      // Add local stream to peer connection
      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', { candidate: event.candidate })
        }
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0]
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0]
            setPeerAudioEnabled(true)
          }
        }
      }

      // Create and send offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socketRef.current.emit('voice-call-offer', { offer })

    } catch (error) {
      console.error('Error starting voice call:', error)
      setMessages((prev) => [...prev, { type: 'system', text: 'Failed to start voice call. Please check microphone permissions.' }])
    }
  }

  const handleReceiveOffer = async (data) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      setIsCallActive(true)

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      peerConnectionRef.current = pc

      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', { candidate: event.candidate })
        }
      }

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0]
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0]
            setPeerAudioEnabled(true)
          }
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socketRef.current.emit('voice-call-answer', { answer })

      setMessages((prev) => [...prev, { type: 'system', text: 'Voice call connected!' }])
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  const handleReceiveAnswer = async (data) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer))
        setMessages((prev) => [...prev, { type: 'system', text: 'Voice call connected!' }])
      }
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  }

  const endVoiceCall = (isCleanup = false) => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }
    const wasActive = isCallActive
    setIsCallActive(false)
    setIsMuted(false)
    setPeerAudioEnabled(false)
    setIncomingCall(false)
    setOutgoingCall(false)
    setCallRequestFrom('')
    setLastCallRequestId('') // Reset duplicate prevention
    
    // Stop ringtone if it's playing
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
    
    if (socketRef.current && wasActive && !isCleanup) {
      socketRef.current.emit('voice-call-ended')
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: 'You ended the voice call' }
      ])
      
      // Award XP for participating in voice call
      gamificationRef.current.addXP(30, 'voice_call_participated');
      
      // Award achievement for completing first voice call
      gamificationRef.current.addAchievement({
        _id: 'first_voice_call',
        name: 'First Voice Call',
        description: 'Complete your first voice call with a peer',
        icon: '📞',
        category: 'social'
      });
      
      // Complete daily goal
      gamificationRef.current.completeDailyGoal();
      
      // Track peer chat time (estimate ~5 minutes per call)
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.post('/api/users/track-peer-session', {
            duration: 5 // 5 minutes per peer chat session
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).catch(error => {
            console.error('Failed to track peer session:', error);
          });
        }
      } catch (error) {
        console.error('Error tracking peer session:', error);
      }
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Navbar />
      
      {/* Full-screen Incoming Call Overlay */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-bounce">
            <div className="text-center space-y-6">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center animate-pulse">
                <span className="text-5xl">📞</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Incoming Voice Call</h2>
                <p className="text-lg text-slate-600">
                  <span className="font-semibold text-success-600">{callRequestFrom}</span> wants to talk
                </p>
                <p className="text-sm text-slate-500 mt-2">Practice English conversation together!</p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={rejectVoiceCall}
                  className="flex-1 flex flex-col items-center gap-2 px-6 py-4 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg"
                >
                  <span className="text-3xl">❌</span>
                  <span>Reject</span>
                </button>
                <button
                  onClick={acceptVoiceCall}
                  className="flex-1 flex flex-col items-center gap-2 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white transition-all shadow-lg"
                >
                  <span className="text-3xl">✅</span>
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Contact Requests Notification */}
        {contactRequests.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🔔</span>
              <h3 className="font-bold text-slate-800">Contact Requests ({contactRequests.length})</h3>
            </div>
            <div className="space-y-2">
              {contactRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between bg-white rounded-lg p-3 border-2 border-yellow-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span className="font-semibold text-slate-700">{request.fromUsername}</span>
                    <span className="text-xs text-slate-500">wants to connect</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptContactRequest(request._id, request.fromUsername)}
                      className="px-4 py-1.5 rounded-lg bg-success-500 hover:bg-success-600 text-white text-sm font-bold transition-all"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => rejectContactRequest(request._id, request.fromUsername)}
                      className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Online Users Statistics */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center animate-pulse">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 drop-shadow-sm">{Math.max(0, onlineStats.totalOnline - 1)}</p>
                <p className="text-xs text-gray-600 font-semibold drop-shadow-sm">Other Users Online</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center animate-pulse">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 drop-shadow-sm">{onlineStats.waiting}</p>
                <p className="text-xs text-gray-600 font-semibold drop-shadow-sm">Waiting for Match</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center animate-pulse">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 drop-shadow-sm">{onlineStats.inCall}</p>
                <p className="text-xs text-gray-600 font-semibold drop-shadow-sm">Active Chats</p>
              </div>
            </div>
          </div>

          {/* Online Users List */}
          <div className="bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-xl p-4 shadow-xl lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🌐</span>
              <p className="text-sm font-bold text-gray-800 drop-shadow-sm">Online Users</p>
            </div>
            <div className="max-h-16 overflow-y-auto space-y-1">
              {onlineStats.onlineUsersList && onlineStats.onlineUsersList.length > 0 ? (
                onlineStats.onlineUsersList
                  .filter(u => u.userName !== (user?.username || user?.name || user?.email?.split('@')[0]))
                  .map((onlineUser, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-xs group">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          onlineUser.status === 'in-chat' ? 'bg-success-500' : 
                          onlineUser.status === 'waiting' ? 'bg-yellow-500' : 
                          'bg-neutral-400'
                        }`} />
                        <span className="text-gray-700 font-medium truncate drop-shadow-sm">{onlineUser.userName}</span>
                        {isInContacts(onlineUser.userName) && (
                          <span className="text-primary-500 drop-shadow-sm" title="In your contacts">⭐</span>
                        )}
                      </div>
                      {!isInContacts(onlineUser.userName) && !hasSentRequest(onlineUser.userName) && (
                        <button
                          onClick={() => sendContactRequest(onlineUser.userName)}
                          className="text-primary-600 hover:bg-primary-50 px-2 py-1 rounded font-bold text-xs transition-all flex-shrink-0 drop-shadow-sm"
                          title="Send contact request"
                        >
                          +
                        </button>
                      )}
                      {hasSentRequest(onlineUser.userName) && (
                        <span className="text-gray-500 text-xs flex-shrink-0 drop-shadow-sm" title="Request sent">📤</span>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-xs text-gray-500 drop-shadow-sm">No other users online</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-transparent pointer-events-none"></div>
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-primary-50 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-300 mb-2">
                  <span className="text-xl">🌍</span>
                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">English Practice</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-800">Random Peer Chat</h1>
                <p className="text-sm text-slate-600 mt-1">Connect with strangers to practice English conversation</p>
                {matched && peerName && (
                  <div className="mt-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 border-success-300">
                        <span className="text-xl">👤</span>
                        <span className="text-sm font-semibold text-slate-700">
                          Chatting with <span className="text-success-600">{peerName}</span>
                        </span>
                      </div>
                      {!isInContacts(peerName) && !hasSentRequest(peerName) && (
                        <button
                          onClick={() => sendContactRequest(peerName)}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-success-500 hover:bg-success-600 text-white text-sm font-bold transition-all shadow-md"
                          title="Send contact request"
                        >
                          <span>👥</span>
                          <span>Add to Contacts</span>
                        </button>
                      )}
                      {hasSentRequest(peerName) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-100 border-2 border-yellow-300 text-yellow-700 text-sm font-bold">
                          <span>📤</span>
                          <span>Request Sent</span>
                        </span>
                      )}
                      {isInContacts(peerName) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-100 border-2 border-primary-300 text-primary-700 text-sm font-bold">
                          <span>⭐</span>
                          <span>In Contacts</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold shadow-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  matched ? 'bg-success-500' : connected ? 'bg-yellow-500' : 'bg-red-500'
                } animate-pulse`} />
                <span className="text-slate-700">{status}</span>
              </div>
            </div>
          </div>

          {/* Voice Call Controls */}
          {matched && (
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-primary-50 border-b border-slate-200">
              {/* Outgoing Call Waiting */}
              {outgoingCall && (
                <div className="mb-4 p-4 rounded-xl bg-white border-2 border-yellow-400 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center animate-pulse">
                      <span className="text-xl">⏳</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Calling {peerName}...</p>
                      <p className="text-sm text-slate-600">Waiting for response</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {isCallActive && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 border-success-300">
                      <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-semibold text-slate-700">Voice call active</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isCallActive && !incomingCall && !outgoingCall ? (
                    <button
                      onClick={requestVoiceCall}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 transition-all shadow-sm"
                    >
                      <span className="text-lg">📞</span>
                      <span>Start Voice Call</span>
                    </button>
                  ) : isCallActive ? (
                    <>
                      <button
                        onClick={toggleMute}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${
                          isMuted
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-white border-2 border-neutral-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-lg">{isMuted ? '🔇' : '🎤'}</span>
                        <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                      </button>
                      <button
                        onClick={endVoiceCall}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm"
                      >
                        <span className="text-lg">☎️</span>
                        <span>End Call</span>
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div className="h-[28rem] overflow-y-auto p-6 bg-slate-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                {matched ? (
                  <>
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p className="font-semibold text-slate-700 text-lg">Start the conversation!</p>
                    <p className="text-sm text-slate-500">Say hello and practice your English</p>
                  </>
                ) : connected ? (
                  <>
                    <div className="h-16 w-16 rounded-full border-4 border-dashed border-neutral-300 flex items-center justify-center animate-spin">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <p className="font-semibold text-slate-700 text-lg">Looking for a peer...</p>
                    <p className="text-sm text-slate-500">We're finding someone for you to chat with</p>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full border-4 border-dashed border-neutral-300 flex items-center justify-center">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <p className="font-semibold text-slate-700 text-lg">Connecting...</p>
                    <p className="text-xs text-slate-500">Make sure the backend server is running</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                        msg.type === 'me'
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                          : msg.type === 'system'
                          ? 'bg-slate-100 text-slate-600 text-center mx-auto border-2 border-slate-200'
                          : 'bg-white text-slate-800 border-2 border-slate-200'
                      }`}
                    >
                      {msg.type === 'system' ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg">ℹ️</span>
                          <span className="text-xs uppercase tracking-wide">{msg.text}</span>
                        </div>
                      ) : (
                        <>
                          {msg.sender && msg.type === 'peer' && (
                            <div className="text-xs font-semibold mb-1 text-primary-600">{msg.sender}</div>
                          )}
                          <p className="break-words">{msg.text}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-xs px-4 py-3 rounded-2xl bg-white border-2 border-slate-200">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-6 border-t border-slate-200 bg-white">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  handleTyping()
                }}
                placeholder={matched ? 'Type your message in English...' : 'Waiting for a peer...'}
                disabled={!connected || !matched}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60 font-medium transition-all"
              />
              <button
                type="submit"
                disabled={!connected || !matched || !input.trim()}
                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Send
              </button>
            </div>
            {matched && (
              <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                <span>💡</span>
                <span>Tip: Practice greetings, introductions, and everyday conversations!</span>
              </div>
            )}
          </form>
        </div>
      </div>
      {/* Hidden audio elements */}
      <audio ref={remoteAudioRef} autoPlay />
      <audio ref={ringtoneRef} loop>
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZPQ0VZbXq7KdaGgxBnN/yuXEdBzWM1PLTejAGHW/A7+OZ" type="audio/wav" />
      </audio>
    </div>
  )
}

export default PeerChat

