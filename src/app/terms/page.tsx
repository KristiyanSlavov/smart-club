/**
 * Smart Club — Proprietary Software
 * Copyright (c) 2026 Кристиян Славов. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or use of this software,
 * in whole or in part, is strictly prohibited without prior written permission.
 * Protected under applicable copyright and intellectual property laws.
 */

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Условия за ползване - Smart Club",
};

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#0d0d0d] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#32cd32] transition-colors"
        >
          <ArrowLeft className="size-4" />
          Начало
        </Link>

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <Shield className="size-10 text-[#32cd32] shrink-0" />
          <div>
            <h1 className="text-3xl font-bold text-white">
              Условия за ползване
            </h1>
            <p className="mt-1 text-sm text-white/40">
              Последна актуализация: Март 2026
            </p>
          </div>
        </div>

        {/* Section 1: Intellectual Property */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[#32cd32]">
            1. Интелектуална собственост
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              Всички права върху интелектуалната собственост, свързани със
              системата Smart Club, включително, но не само: софтуерен код,
              потребителски интерфейс, дизайн, графични елементи, лога, икони,
              база данни, архитектурни решения и документация, са изключителна
              собственост на Кристиян Славов (наричан по-долу &quot;Автора&quot;).
            </p>
            <p>
              Никоя част от тази система не може да бъде копирана,
              възпроизвеждана, разпространявана, продавана, отдавана под наем,
              лицензирана, модифицирана или използвана по какъвто и да е начин
              без изричното писмено съгласие на Автора.
            </p>
            <p>
              Търговските марки, наименованията на услугите и логата, използвани
              в Smart Club, са собственост на Автора и не могат да бъдат
              използвани без предварително разрешение.
            </p>
          </div>
        </section>

        {/* Section 2: Copyright */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[#32cd32]">
            2. Авторско право
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              Системата Smart Club и всичките ѝ компоненти са защитени от Закона
              за авторското право и сродните му права на Република България, както
              и от международните конвенции за авторско право, включително
              Бернската конвенция и Договора на СОИС за авторско право (WCT).
            </p>
            <p>
              Изходният код на Smart Club представлява оригинално авторско
              произведение и е защитен като литературно произведение съгласно чл.
              3, ал. 1, т. 1 от ЗАПСП. Правата върху него принадлежат изцяло на
              Кристиян Славов.
            </p>
            <p>
              Забранява се всяко неразрешено копиране, декомпилиране,
              дизасемблиране, модифициране или разпространение на софтуера или
              части от него. Нарушаването на авторските права може да доведе до
              гражданска и наказателна отговорност съгласно действащото
              законодателство.
            </p>
            <p>
              &copy; 2026 Кристиян Славов. Всички права запазени.
            </p>
          </div>
        </section>

        {/* Section 3: Reverse Engineering Prohibition */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[#32cd32]">
            3. Забрана за Реверсивен Инженеринг
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              Строго се забранява извършването на реверсивен инженеринг
              (reverse engineering), декомпилация, дизасемблиране или всякакъв
              друг опит за извличане на изходния код, алгоритмите, структурата на
              базата данни или бизнес логиката на системата Smart Club.
            </p>
            <p>
              Тази забрана обхваща, но не се ограничава до:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Декомпилация или дизасемблиране на компилирания софтуер с цел
                възстановяване на изходния код.
              </li>
              <li>
                Анализ на мрежовия трафик с цел извличане на API структурата или
                протоколи на комуникация.
              </li>
              <li>
                Копиране на потребителския интерфейс, дизайн или
                функционалността на системата за създаване на конкурентен продукт.
              </li>
              <li>
                Извличане на данни от базата данни чрез неоторизиран достъп или
                автоматизирани средства (scraping).
              </li>
              <li>
                Заобикаляне на технически мерки за защита, включително, но не
                само: механизми за автентикация, криптографски защити и контроли
                за достъп.
              </li>
            </ul>
            <p>
              Нарушаването на тази забрана може да доведе до незабавно
              прекратяване на достъпа до системата и предприемане на правни
              действия, включително иск за обезщетение за претърпени вреди и
              пропуснати ползи, съгласно приложимото законодателство на Република
              България и Европейския съюз.
            </p>
          </div>
        </section>

        {/* Section 4: Contact */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[#32cd32]">
            4. Контакт
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-white/70">
            <p>
              За въпроси относно тези условия или за получаване на разрешение за
              използване на материали от Smart Club, моля свържете се с Автора.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 pt-6 pb-4 text-center text-[11px] text-white/20">
          &copy; 2026 Кристиян Славов. Всички права запазени. &middot;
        </footer>
      </div>
    </main>
  );
}
