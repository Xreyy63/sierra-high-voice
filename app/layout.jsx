export const metadata = {
  title: 'Sierra High - Student Voice',
  description: 'Allow students to voice concerns to Sierra High'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
