import Script from "next/script";

const GoogleAnalytics = () => {
    return (
        <>
            <Script
                strategy="lazyOnload"
                src={`https://www.googletagmanager.com/gtag/js?id=G-J9035T5XDT`}
            />
            <Script id="" strategy="lazyOnload">
                {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-J9035T5XDT');
          `}
            </Script>
        </>
    );
};

export default GoogleAnalytics;