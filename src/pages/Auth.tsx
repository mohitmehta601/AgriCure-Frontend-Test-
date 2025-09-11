import { useParams, Navigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';

export default function Auth() {
  const { step } = useParams<{ step: string }>();
  
  const validSteps = ['signup', 'login'];
  const authStep = validSteps.includes(step || '') ? (step as 'signup' | 'login') : 'signup';
  
  if (step && !validSteps.includes(step)) {
    return <Navigate to="/auth/signup" replace />;
  }

  return <AuthLayout initialStep={authStep} />;
}