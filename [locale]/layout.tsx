import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import SessionLayout from '@/components/session/SessionLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import { locales } from '@/i18n/config';
import { ModalProvider } from './ModalProvider';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ModalProvider>
        <SessionLayout>
          <AuthGuard>
            {children}
          </AuthGuard>
        </SessionLayout>
      </ModalProvider>
    </NextIntlClientProvider>
  );
}