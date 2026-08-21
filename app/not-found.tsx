import Link from 'next/link'

export default function NotFound() {
  return (
    <main>
      <h1>Страница не найдена</h1>
      <p>Возможно, адрес введён с ошибкой или страница была удалена.</p>
      <Link href="/">На главную</Link>
    </main>
  )
}
