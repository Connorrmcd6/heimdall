import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Spinner } from '../ui/spinner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '../ui/input-otp';
import { Shield, Check, QrCode } from 'lucide-react';

export const MFASetupForm: React.FC = () => {
  const { setupMFA, confirmMFASetup, isLoading } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleStartSetup = async () => {
    try {
      setError('');
      const { qrCode, secret } = await setupMFA();
      setQrCode(qrCode);
      setSecret(secret);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    }
  };

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.length !== 6) return;

    try {
      setError('');
      await confirmMFASetup(verificationCode);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      // Clear the code on error
      setVerificationCode('');
    }
  };

  const handleCodeChange = (value: string) => {
    setVerificationCode(value);
    // Clear any previous errors when user starts typing
    if (error) {
      setError('');
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">MFA Enabled!</CardTitle>
          <CardDescription>
            Two-factor authentication has been successfully enabled for your account.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Enable Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'setup' ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Install an authenticator app like Google Authenticator or Authy</p>
              <p>2. Click "Generate QR Code" below</p>
              <p>3. Scan the QR code with your authenticator app</p>
              <p>4. Enter the 6-digit code to verify</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleStartSetup}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <QrCode className="mr-2 h-4 w-4" />}
              Generate QR Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">QR Code would appear here</p>
                <p className="text-xs text-gray-400 mt-2 font-mono">Secret: {secret}</p>
              </div>
            </div>

            <form onSubmit={handleVerifySetup} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label htmlFor="verificationCode" className="text-center block">
                  Enter Verification Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={handleCodeChange}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Enter the code from your authenticator app
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Verify & Enable MFA
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('setup')}
                disabled={isLoading}
                className="w-full"
              >
                Back
              </Button>
            </form>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Demo:</strong> Use code <code className="bg-blue-100 px-1 rounded">123456</code>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};