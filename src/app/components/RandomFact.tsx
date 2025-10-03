"use client";
import React, { useEffect, useState } from "react";
import randomFacts from "../lib/didyouknowfacts.json";

export default function RandomFact() {
    const [fact, setFact] = useState<string | null>(null);

    useEffect(() => {
        const i = Math.floor(Math.random() * randomFacts.length);
        setFact(randomFacts[i].text);
    }, []);

    if (!fact) {
        return <h2 className="text-asparagus text-xl font-semibold">Loading...</h2>;
    }

    return <h2 className="text-shadow text-asparagus text-xl font-semibold">{fact}</h2>;
}
