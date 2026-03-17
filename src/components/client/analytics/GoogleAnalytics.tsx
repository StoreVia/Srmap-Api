import React from "react";
import Script from "next/script";

const GoogleAnalytics = () => {
    return (
        <>
            <Script
                strategy="lazyOnload"
                src={`https://www.googletagmanager.com/gtag/js?id=G-F861JN7601`}
            />
            <Script id="" strategy="lazyOnload">
                {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-CRDSRT3JEQ');
          `}
            </Script>
        </>
    );
};

export default GoogleAnalytics;