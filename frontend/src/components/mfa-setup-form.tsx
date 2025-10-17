import React, { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MFASetupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { setupMFA, confirmMFASetup, isLoading } = useAuth()
  const [qrCode, setQrCode] = useState<string>("")
  const [secret, setSecret] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [step, setStep] = useState<"setup" | "verify">("setup")

  const handleSetup = async () => {
    setError("")
    setSuccess("")
    try {
      const { qrCode, secret } = await setupMFA()
      setQrCode(qrCode)
      setSecret(secret)
      setStep("verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup MFA")
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    try {
      await confirmMFASetup(code)
      setSuccess("MFA setup complete! You are now protected.")
    } catch (err: any) {
      if (err.code === 'CodeMismatchException' || err.message.includes('Invalid code')) {
        setError("Invalid verification code. Please try again.");
        setCode("");
      } else {
        setError(err instanceof Error ? err.message : "Verification failed")
      }
    }
  }

  React.useEffect(() => {
    handleSetup()
    // eslint-disable-next-line
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleVerify}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Set up Multi-Factor Authentication</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Scan the QR code below with your authenticator app and enter the 6-digit code to verify.
                </p>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              {step === "verify" && (
                <>
                  <Field className="flex flex-col items-center">
                    <FieldLabel>Scan QR Code</FieldLabel>
                    <div className="my-4">
                      {qrCode ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                            qrCode
                          )}&size=180x180`}
                          alt="MFA QR Code"
                          className="mx-auto"
                        />
                      ) : (
                        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                      )}
                    </div>
                    <FieldDescription className="text-center">
                      Or enter this secret manually: <span className="font-mono">{secret}</span>
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="mfa-code">Verification Code</FieldLabel>
                    <Input
                      id="mfa-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      required
                    />
                    <FieldDescription>
                      Enter the 6-digit code from your authenticator app.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <Button type="submit" disabled={isLoading || code.length !== 6}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? "Verifying..." : "Verify & Enable MFA"}
                    </Button>
                  </Field>
                </>
              )}
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Secure your account
              </FieldSeparator>
              <FieldDescription className="text-center">
                MFA is required for your account security.
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}