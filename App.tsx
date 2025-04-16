import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
  Video,
} from '@stream-io/video-react-native-sdk';

const apiKey = 'n85rvmqapbuj'; // API Key from Stream
const client = new StreamVideoClient({ apiKey });

const generateRandomUserId = () => 'user-' + Math.random().toString(36).substring(2, 8);

const App = () => {
  const [userId] = useState(generateRandomUserId);
  const [callId, setCallId] = useState('');
  const [token, setToken] = useState(null);
  const [call, setCall] = useState(null);

  // Fetch token for video call
  useEffect(() => {
    if (!userId || !callId) return;

    const fetchToken = async () => {
      try {
        const response = await fetch(`http://192.168.0.18:3002/generate-video-token?userId=${userId}&callId=${callId}`);
        const data = await response.json();
        console.log('Fetched video token:', data.token);  // Debugging token
        setToken(data.token);
      } catch (err) {
        console.error('Video token fetch failed:', err);
      }
    };

    fetchToken();
  }, [userId, callId]);  // The dependencies are userId and callId, only fetch token when they change

  // Set up call when token is fetched
  useEffect(() => {
    if (token && callId) {
      const setupCall = async () => {
        try {
          console.log('Attempting to join the call with token and callId:', { token, callId });

          const callClient = await client.call({
            token,
            callId,
            userId,
          });

          console.log('Call client:', callClient); // Debugging the call client object

          // After getting the call object, set it in state
          setCall(callClient);
        } catch (err) {
          console.error('Error setting up the call:', err);
        }
      };

      setupCall();
    }
  }, [token, callId]);

  // Show form to enter Call ID
  if (!callId) {
    return (
      <View style={styles.container}>
        <Text>Enter Call Room ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. team-meeting"
          value={callId}
          onChangeText={setCallId}  // Update callId as user types
        />
        <Button
          title="Join Call"
          onPress={() => setCallId(callId.trim())}
        />
      </View>
    );
  }
console.log({
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
  Video,
});

  // Show loading state
  if (!call) return <Text>Joining <Text style={{ fontWeight: 'bold' }}>{callId}</Text> as{' '}</Text>;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <View style={styles.streamContainer}>
            <Text>Hi</Text>
          <Text style={styles.text}>You are: {userId}</Text>
          <Text style={styles.text}>Call ID: {callId}</Text>
          <Text style={styles.text}>Participants: {call.state.participants.length}</Text>

          <View style={styles.participantsList}>
            {call.state.participants.map((p) => (
              <Text key={p.sessionId}>{p.user?.id || 'Unknown User'}</Text>
            ))}
          </View>

          {/* Local Video Stream */}
          <View style={styles.localVideo}>
            {call?.state?.localParticipant && (
              <Video participant={call.state.localParticipant} />
            )}
          </View>

          {/* Other Participants */}
          <SpeakerLayout />
          <CallControls />
        </View>
      </StreamCall>
    </StreamVideo>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '80%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  streamContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  participantsList: {
    marginTop: 10,
    marginBottom: 20,
  },
  localVideo: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 120,
    height: 150,
  },
});

export default App;
