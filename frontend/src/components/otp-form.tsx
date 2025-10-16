import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  const { verifyMFA, isLoading, logout, pendingMFAUser } = useAuth()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || code.length !== 6) return

    try {
      setError("")
      await verifyMFA(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
      // Clear the code on error so user can try again
      setCode("")
    }
  }

  const handleCancel = () => {
    logout() // This will clear the MFA state and redirect to login
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    // Clear any previous errors when user starts typing
    if (error) {
      setError("")
    }
  }

  return (
    <div
      className={cn("flex flex-col gap-6 md:min-h-[450px]", className)}
      {...props}
    >
      <Card className="flex-1 overflow-hidden p-0">
        <CardContent className="grid flex-1 p-0 md:grid-cols-2">
          <form 
            className="flex flex-col items-center justify-center p-6 md:p-8"
            onSubmit={handleSubmit}
          >
            <FieldGroup>
              <Field className="items-center text-center">
                <h1 className="text-2xl font-bold">Enter verification code</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  {pendingMFAUser?.email 
                    ? `We sent a 6-digit code to ${pendingMFAUser.email}`
                    : "We sent a 6-digit code to your email"
                  }
                </p>
              </Field>

              {error && (
                <Field>
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </Field>
              )}

              <Field className="flex flex-col items-center">
                <FieldLabel htmlFor="otp" className="sr-only">
                  Verification code
                </FieldLabel>
                <div className="flex justify-center w-full">
                  <InputOTP
                    maxLength={6}
                    id="otp"
                    required
                    containerClassName="gap-4 mx-auto justify-center"
                    value={code}
                    onChange={handleCodeChange}
                    disabled={isLoading}
                    className="mx-auto"
                  >
                    <InputOTPGroup className="flex justify-center">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup className="flex justify-center">
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <FieldDescription className="text-center">
                  Enter the 6-digit code sent to your email.
                </FieldDescription>
              </Field>

              <Field>
                <Button 
                  type="submit" 
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
                <FieldDescription className="text-center">
                  Didn&apos;t receive the code? <a href="#" onClick={(e) => { e.preventDefault(); setCode("") }}>Resend</a>
                </FieldDescription>
              </Field>

              {/* <Field>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleCancel} 
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Field> */}

              {/* <Field>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Demo Code:</strong> Use <code className="bg-background px-1 rounded">123456</code> to verify
                  </p>
                </div>
              </Field> */}
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
      <FieldDescription className="text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}