import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";
import { useToast } from "@/hooks/use-toast";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add login scope for additional permissions if needed
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Use signInWithPopup for better UX, fallback to redirect on mobile
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: {
        id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      },
      credential: GoogleAuthProvider.credentialFromResult(result),
    };
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    
    let errorMessage = error.message;
    
    // Provide more user-friendly error messages
    if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled in Firebase. Please contact the administrator to enable it in the Firebase console.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'The login popup was blocked by your browser. Please enable popups or try again.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'The login was canceled. Please try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'The login request was canceled. Please try again.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'A network error occurred. Please check your internet connection and try again.';
    }
    
    return {
      success: false,
      error: {
        code: error.code,
        message: errorMessage,
        email: error.customData?.email,
      },
    };
  }
};

// Function to check if there's a redirect result
export const handleAuthRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return {
        success: true,
        user: {
          id: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        },
        credential: GoogleAuthProvider.credentialFromResult(result),
      };
    }
    return { success: false };
  } catch (error: any) {
    console.error("Auth redirect error:", error);
    
    let errorMessage = error.message;
    
    // Provide more user-friendly error messages
    if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled in Firebase. Please contact the administrator to enable it in the Firebase console.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'A network error occurred. Please check your internet connection and try again.';
    }
    
    return {
      success: false,
      error: {
        code: error.code,
        message: errorMessage,
        email: error.customData?.email,
      },
    };
  }
};

export { auth };