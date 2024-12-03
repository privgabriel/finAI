import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/Home/Index";
import LoginScreen from "./src/screens/SignIn/";
import RegisterScreen from "./src/screens/SignUp/index";
import NewTransaction from "./src/screens/NewTransaction";
import EditTransactionScreen from "./src/screens/EditTransaction";
import { AuthProvider } from "./src/context/AuthContext";

const Stack = createStackNavigator();

const AppNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: true, title: "Início" }}
        />
        <Stack.Screen
            name="NewTransaction"
            component={NewTransaction}
            options={{ headerShown: true
            , title: "Nova Transação" }}
        />
        <Stack.Screen
            name="EditTransaction"
            component={EditTransactionScreen}
            options={{ headerShown: true
            , title: "Editar Transação" }}
        />
    </Stack.Navigator>
);

const App = () => {
    const navigationRef = useRef();

    return (
        <AuthProvider>
            <NavigationContainer ref={navigationRef}>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
};

export default App;
