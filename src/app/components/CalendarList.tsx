"use client";
import React, { useEffect, useState } from "react";
import CalendarButton from "./CalendarButton";
import { CgCalendar } from "react-icons/cg";

export default function CalendarList() {

  const [items, setItems] = useState([]);

  useEffect(() => {

    fetch("/api/calendars")

      .then((res) => res.json())

      .then((data) => {

        setItems(data.items || []);

      })

      .catch(console.error);

  }, []);

  return (
    <div className="py-1 flex flex-col gap-1 rounded-md">

      {items.map((c: any) => (

        <CalendarButton

          key={c.id}
          name={c.summary || "Unnamed Calendar"}
          icon={<CgCalendar size={25} />}
          backgroundColor={c.backgroundColor || "#ffffff"}
          textColor={c.foregroundColor || "#000000"}

        />
        

      ))}

    </div>

  );

}
