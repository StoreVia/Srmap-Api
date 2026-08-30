import Script from "next/script";

const GoogleAnalytics = () => {
    return (
        <>
            <Script
                strategy="lazyOnload"
                src={`https://www.googletagmanager.com/gtag/js?id=G-S21W7V6025`}
            />
            <Script id="" strategy="lazyOnload">
                {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-S21W7V6025');
          `}
            </Script>
        </>
    );
};

export default GoogleAnalytics;