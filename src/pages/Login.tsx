import { useMutation,useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { login } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loginSchema } from '../types/validations/schema'
import type { LoginRequest } from '../types/auth'
import { useTranslation } from 'react-i18next'
import Header from '../layouts/Header'
import { useToast } from '../contexts/ToastContex'
import { useAuth } from '../hooks/useAuth'

export const LoginPage = () => {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { authenticateUser } = useAuth()

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      localStorage.setItem('jwtToken', response.token)
      const decoded = JSON.parse(atob(response.token.split('.')[1]))
      const user: any = {
        email: decoded.sub,
        id: decoded.id,
        authorities: decoded.authorities || [],
      }
      authenticateUser(user)
      queryClient.invalidateQueries({ queryKey: ['login'] })

      addToast({
        title: t('messages.success') || '',
        description: t('messages.loginSuccess') || '',
        variant: 'success',
      })

      navigate('/')
    },
    onError: (error: Error) => {
      addToast({
        title: t('messages.error') || '',
        description: error?.message || '',
        variant: 'error',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = loginSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    mutation.mutate(result.data)
  }

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md px-6 ">
          <CardContent>
            <h2 className="text-2xl font-bold mb-6 text-center">{t('login.title')}</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <Label>{t('common.emailPlaceholder')}</Label>
                <Input
                  type="text"
                  // placeholder={t('common.emailPlaceholder')}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="mt-4">
                <Label>{t('login.passwordPlaceholder')}</Label>
                <Input
                  type="password"
                  // placeholder={t('login.passwordPlaceholder')}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
              <div>
                <Button variant={'default'} type="submit" className="flex w-full mt-4 bg-green-700 hover:bg-green-700">
                  {t('common.login')}
                </Button>
              </div>
              <div className="flex justify-center">
                <Button variant="link" className="mt-4" onClick={() => navigate('/forgot-password')}>
                  {t('login.forgotPassword')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default LoginPage