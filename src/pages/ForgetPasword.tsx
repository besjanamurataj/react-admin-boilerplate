import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../layouts/Header'

export const ForgetPasswordPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [formData, setFormData] = useState<{ email: string }>({
    email: '',
  })

  const [errors] = useState<Record<string, string>>({})
  return (
    <div>
      {' '}
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6 mt-10">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4 text-center">{t('forgotPassword.title')}</h2>
            <p className="text-center mb-4">{t('forgotPassword.description')}</p>
            <div>
              <Label>{t('common.emailPlaceholder')}</Label>
              <Input
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <Button variant={'default'} className="flex bg-green-700 hover:bg-green-700 w-full mt-4">
                {t('forgotPassword.resetButton')}
              </Button>
            </div>
            <div className="flex justify-center">
              <Button variant="link" className="mt-2" onClick={() => navigate('/login')}>
                <ChevronLeft size={'18px'} />
                {t('forgotPassword.backToLogin')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default ForgetPasswordPage