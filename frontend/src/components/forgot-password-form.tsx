import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { z } from "zod"
import { useAuth } from "../contexts/AuthContext"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
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

// Schema for step 1: request password reset
const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

// Schema for step 2: confirm new password with code
const confirmSchema = z.object({
  code: z.string().min(1, "Verification code is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type ForgotFormData = z.infer<typeof forgotSchema>
type ConfirmFormData = z.infer<typeof confirmSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { resetPassword, confirmResetPassword } = useAuth()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"request" | "confirm">("request")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form for requesting password reset
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  // Form for confirming new password with code
  const {
    register: registerConfirm,
    handleSubmit: handleSubmitConfirm,
    formState: { errors: confirmErrors },
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmSchema),
  })

  const onSubmitRequest = async (data: ForgotFormData) => {
    setIsSubmitting(true)
    setError("")
    setSuccess("")
    try {
      await resetPassword(data.email)
      setEmail(data.email)
      setStep("confirm")
      setSuccess("Check your email for a verification code.")
    } catch (err: any) {
      if (err.code === 'UserNotFoundException') {
        // For security reasons, don't reveal if email exists or not
        setSuccess("If an account with this email exists, a verification code has been sent.")
      } else {
        setError(err instanceof Error ? err.message : "Reset failed")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitConfirm = async (data: ConfirmFormData) => {
    setIsSubmitting(true)
    setError("")
    setSuccess("")
    try {
      await confirmResetPassword(email, data.code, data.password)
      setSuccess("Password reset successful! You can now log in with your new password.")
    } catch (err: any) {
      if (err.code === 'CodeMismatchException') {
        setError("Invalid verification code. Please try again.")
      } else {
        setError(err instanceof Error ? err.message : "Reset failed")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackButton = () => {
    if (step === "confirm") {
      setStep("request")
      setError("")
      setSuccess("")
    }
  }

  // Render request password form (step 1)
  const renderRequestForm = () => (
    <form className="p-6 md:p-8" onSubmit={handleSubmitForgot(onSubmitRequest)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground text-balance">
            Enter your email to reset your password
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
        
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="demo@heimdall.com"
            className={forgotErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            {...registerForgot("email")}
          />
          {forgotErrors.email && (
            <p className="text-sm text-destructive">{forgotErrors.email.message}</p>
          )}
        </Field>
        
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Sending..." : "Send reset code"}
          </Button>
        </Field>
        
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or go back
        </FieldSeparator>
        
        <Field className="grid grid-cols-1 gap-4">
          <Button variant="outline" type="button" asChild>
            <Link to="/login">Back to Login</Link>
          </Button>
        </Field>
        
        <FieldDescription className="text-center">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )

  // Render confirm password form (step 2)
  const renderConfirmForm = () => (
    <form className="p-6 md:p-8" onSubmit={handleSubmitConfirm(onSubmitConfirm)}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground text-balance">
            Enter the verification code sent to {email} and choose a new password
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
        
        <Field>
          <FieldLabel htmlFor="code">Verification Code</FieldLabel>
          <Input
            id="code"
            type="text"
            placeholder="123456"
            className={confirmErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}
            {...registerConfirm("code")}
          />
          {confirmErrors.code && (
            <p className="text-sm text-destructive">{confirmErrors.code.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              className={confirmErrors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
              {...registerConfirm("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {confirmErrors.password && (
            <p className="text-sm text-destructive">{confirmErrors.password.message}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
          <div className="relative">
            <Input 
              id="confirm-password" 
              type={showConfirmPassword ? "text" : "password"}
              className={confirmErrors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
              {...registerConfirm("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {confirmErrors.confirmPassword && (
            <p className="text-sm text-destructive">{confirmErrors.confirmPassword.message}</p>
          )}
        </Field>
        
        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Resetting Password..." : "Reset Password"}
          </Button>
        </Field>
        
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or go back
        </FieldSeparator>
        
        <Field>
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleBackButton}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Email Form
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {step === "request" ? renderRequestForm() : renderConfirmForm()}
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