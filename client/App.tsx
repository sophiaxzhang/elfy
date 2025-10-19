import React, { useEffect, useState } from 'react';
import { Button, View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
//import { setUser } from './services/userService';
import StartScreen from './screens/StartScreen';
import { AuthProvider } from './context/AuthContext';
import DashboardScreen from './screens/DashboardScreen';
import FamilySetupScreen from './screens/FamilySetupScreen';
import PaymentSetupScreen from './screens/PaymentSetupScreen';
import TokenConfigScreen from './screens/TokenConfigScreen';
import ChildTaskDashboard from './screens/ChildTaskDashboard';
import TaskDetailScreen from './screens/TaskDetailScreen';
import SelectChild from './screens/SelectChild';
import ChildOverview from './screens/ChildOverview';
import AddTask from './screens/AddTask';
import { TaskProvider } from './context/TaskContext';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Start: undefined;
  Signup: undefined;
  Dashboard: undefined;
  FamilySetup: undefined;
  PaymentSetup: undefined;
  TokenConfig: undefined;
  SelectChild: undefined;
  ChildOverview: { child: any };
  AddTask: { child: any };
  ChildTaskDashboard: undefined;
  TaskDetail: { task: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// interface User {
//   name: string;
//   email: string;
// }
function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>();
  // const [allUsers, setAllUsers] = useState<User[]>([]);

  // //get all users
  // async function fetchUsers() {
  //   const result = await getUser();
  //   console.log("fetched user:", result);
  //   setAllUsers(result);
  // }

  // useEffect(() => {
  //   fetchUsers();
  // }, []);
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
      <Button title="SignUp" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Start">
            <Stack.Screen name="Start" component={StartScreen}
            options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen}
            options={{ headerShown: false }}/>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Signup" component={SignupScreen}/>
            <Stack.Screen name="FamilySetup" component={FamilySetupScreen}
            options={{ headerShown: false }} />
            <Stack.Screen name="PaymentSetup" component={PaymentSetupScreen}
            options={{ headerShown: false }} />
            <Stack.Screen name="TokenConfig" component={TokenConfigScreen}
            options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={DashboardScreen}/>
            <Stack.Screen name="SelectChild" component={SelectChild}
            options={{ headerShown: false }}/>
            <Stack.Screen name="ChildOverview" component={ChildOverview}
            options={{ headerShown: false }}/>
            <Stack.Screen name="AddTask" component={AddTask}
            options={{ headerShown: false }}/>
            <Stack.Screen name="ChildTaskDashboard" component={ChildTaskDashboard}
            options={{ headerShown: false }}/>
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen}
            options={{ headerShown: false }}/>
          </Stack.Navigator>
        </NavigationContainer>
      </TaskProvider>
    </AuthProvider>
  );
}
