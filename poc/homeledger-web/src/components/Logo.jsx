import { useEffect, useState } from "react";
import IconLight from "@assets/icon-light.svg";
import IconDark from "@assets/icon-dark.svg";
import LogoHorizontal from "@assets/logo-horizontal.svg";
import LogoHorizontalLight from "@assets/logo-horizontal-light.svg";

export default function Logo({ horizontal = false }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);
        mq.addEventListener("change", (e) => setIsDark(e.matches));
    }, []);

    if (horizontal) {
        if (isDark)
            return <img src={LogoHorizontalLight} alt="HomeLedger" height={40} />;
        else return <img src={LogoHorizontal} alt="HomeLedger" height={40} />;
    }

    return (
        <img
            src={isDark ? IconDark : IconLight}
            alt="HomeLedger"
            height={40}
        />
    );
}