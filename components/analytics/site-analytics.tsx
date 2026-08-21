import Script from 'next/script'

/**
 * Счётчики подключаются только через переменные окружения.
 * Пусто — блок не рендерится. Идентификаторы никогда
 * не попадают в код: один контейнер на двух сайтах смешивает статистику.
 *
 * afterInteractive: beforeInteractive блокирует загрузку страницы,
 * а lazyOnload теряет события первых секунд — как раз те,
 * где человек нажимает «позвонить».
 */
export function SiteAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null

  const gtm = process.env.NEXT_PUBLIC_GTM_ID
  const ym = process.env.NEXT_PUBLIC_YM_ID
  const pixel = process.env.NEXT_PUBLIC_FB_PIXEL_ID

  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {ym && (
        <Script id="ym" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
ym(${ym},'init',{webvisor:true,clickmap:true,accurateTrackBounce:true,trackLinks:true});`}
        </Script>
      )}

      {pixel && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
