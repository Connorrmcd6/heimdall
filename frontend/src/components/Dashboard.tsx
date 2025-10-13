import React from 'react';
import { MFASetupForm } from './auth/MFASetupForm';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { LogOut, Shield, FileText, Upload, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout, disableMFA, isLoading } = useAuth();
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showMFADisable, setShowMFADisable] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [mfaError, setMfaError] = useState('');

  const handleDisableMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode.trim()) return;

    try {
      setMfaError('');
      await disableMFA(disableCode);
      setShowMFADisable(false);
      setDisableCode('');
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Failed to disable MFA');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Existing header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Heimdall</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, <span className="font-medium">{user?.name}</span>
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* MFA Status Alert - Show if MFA is not enabled */}
        {!user?.mfaEnabled && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Two-Factor Authentication Recommended
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>Secure your account by enabling two-factor authentication.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100"
                  onClick={() => setShowMFASetup(true)}
                >
                  Enable MFA Now
                </Button>
              </div>
            </div>
          </Alert>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Secure Vault</h2>
          <p className="text-slate-600">Manage and share your sensitive documents securely.</p>
        </div>

        {/* Existing stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 GB</div>
              <p className="text-xs text-muted-foreground">of 10 GB available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No files shared</p>
            </CardContent>
          </Card>
        </div>

        {/* Existing upload section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Drag and drop files here or click to browse your secure documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-slate-400 transition-colors">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Drop files here to upload to your vault</p>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your vault account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Name</p>
                  <p className="text-slate-900">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Email</p>
                  <p className="text-slate-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">User ID</p>
                  <p className="text-slate-900 font-mono text-sm">{user?.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Account Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NEW: Security Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>Manage your account security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* MFA Status Section */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {user?.mfaEnabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-600">
                      {user?.mfaEnabled 
                        ? 'Your account is protected with 2FA' 
                        : 'Add an extra layer of security to your account'
                      }
                    </p>
                  </div>
                </div>
                <div>
                  {user?.mfaEnabled ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowMFADisable(true)}
                    >
                      Disable
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => setShowMFASetup(true)}
                    >
                      Enable MFA
                    </Button>
                  )}
                </div>
              </div>

              {/* Additional Security Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Sessions</p>
                    <p className="text-sm text-slate-600">Manage active sessions</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    View Sessions
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-slate-600">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* MFA Setup Modal - Improved Background */}
      {showMFASetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur and darkening */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowMFASetup(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <MFASetupForm />
              <Button
                variant="outline"
                onClick={() => setShowMFASetup(false)}
                className="w-full mt-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MFA Disable Modal - Improved Background */}
      {showMFADisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur and darkening */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setShowMFADisable(false);
              setDisableCode('');
              setMfaError('');
            }}
          />
          
          {/* Modal Content */}
          <Card className="relative w-full max-w-md shadow-2xl border border-gray-200">
            <CardHeader>
              <CardTitle className="text-red-600">Disable Two-Factor Authentication</CardTitle>
              <CardDescription>
                Enter your current authentication code to disable 2FA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDisableMFA} className="space-y-4">
                {mfaError && (
                  <Alert variant="destructive">
                    <AlertDescription>{mfaError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="disableCode">Authentication Code</Label>
                  <Input
                    id="disableCode"
                    type="text"
                    placeholder="123456"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowMFADisable(false);
                      setDisableCode('');
                      setMfaError('');
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isLoading || disableCode.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    Disable MFA
                  </Button>
                </div>
              </form>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Demo:</strong> Use code <code className="bg-blue-100 px-1 rounded">123456</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};