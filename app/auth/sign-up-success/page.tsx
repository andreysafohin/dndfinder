import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Спасибо за регистрацию!</CardTitle>
              <CardDescription>Проверьте почту для подтверждения</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Вы успешно зарегистрировались. Пожалуйста, проверьте вашу электронную почту и подтвердите аккаунт перед входом.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
