"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/lib/supabase/types";
import {
  calculateProgressPercentage,
  formatDeadlineStatus,
} from "@/lib/utils/progress";
import { AlertCircleIcon, Calendar, Repeat, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface GoalProgressDisplayProps {
  goal: Tables<"goals">;
  cardClassName?: string;
  contextMenu?: React.ReactNode;
  footer?: React.ReactNode;
}

export function GoalProgressDisplay({
  goal,
  cardClassName,
  contextMenu,
  footer,
}: GoalProgressDisplayProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    // Update current time periodically to check for overdue deadlines
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const percentage = calculateProgressPercentage(
    goal.current_amount,
    goal.target_amount
  );

  const isSurpassed = percentage > 100;
  const isComplete = percentage >= 100;
  const deadlineStatus = formatDeadlineStatus(goal.deadline);
  const isOverdue = goal.deadline && goal.deadline < currentTime && !isComplete;

  const getCurrencyFromLocale = (locale: string): string => {
    // Map common locale patterns to currencies
    const localeToCurrency: Record<string, string> = {
      "en-US": "USD",
      "en-GB": "GBP",
      "en-CA": "CAD",
      "en-AU": "AUD",
      "en-NZ": "NZD",
      "de-DE": "EUR",
      "de-AT": "EUR",
      "de-CH": "CHF",
      "fr-FR": "EUR",
      "fr-CA": "CAD",
      "fr-BE": "EUR",
      "es-ES": "EUR",
      "es-MX": "MXN",
      "es-AR": "ARS",
      "it-IT": "EUR",
      "pt-BR": "BRL",
      "pt-PT": "EUR",
      "nl-NL": "EUR",
      "nl-BE": "EUR",
      "pl-PL": "PLN",
      "ru-RU": "RUB",
      "ja-JP": "JPY",
      "ko-KR": "KRW",
      "zh-CN": "CNY",
      "zh-TW": "TWD",
      "hi-IN": "INR",
      "sv-SE": "SEK",
      "no-NO": "NOK",
      "da-DK": "DKK",
    };

    // Try exact match first
    if (localeToCurrency[locale]) {
      return localeToCurrency[locale];
    }

    // Try language code match (e.g., "en" -> "USD")
    const languageCode = locale.split("-")[0];
    const languageToCurrency: Record<string, string> = {
      en: "USD",
      de: "EUR",
      fr: "EUR",
      es: "EUR",
      it: "EUR",
      pt: "EUR",
      nl: "EUR",
      pl: "PLN",
      ru: "RUB",
      ja: "JPY",
      ko: "KRW",
      zh: "CNY",
      hi: "INR",
      sv: "SEK",
      no: "NOK",
      da: "DKK",
    };

    return languageToCurrency[languageCode] || "USD";
  };

  const formatAmount = (amount: number) => {
    if (goal.format === "currency") {
      const locale =
        typeof navigator !== "undefined" ? navigator.language : "en-US";
      const currency = getCurrencyFromLocale(locale);
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
    const locale =
      typeof navigator !== "undefined" ? navigator.language : "en-US";
    return amount.toLocaleString(locale);
  };

  return (
    <Card
      className={`relative ${cardClassName || ""}`}
      style={{
        borderTopColor: goal.color,
        borderTopWidth: "3px",
      }}
    >
      <CardHeader>
        <div className="flex items-center gap-2 -mb-2">
          <CardTitle className={"text-base"}>{goal.name}</CardTitle>
          <div className="flex-1" />
          {isSurpassed && (
            <Badge
              variant="default"
              className="bg-amber-300 text-amber-950 gap-1"
            >
              <AlertCircleIcon className="h-3 w-3" />
              Surpassed!
            </Badge>
          )}
          {isComplete && !isSurpassed && (
            <Badge variant="default" className="bg-green-600 gap-1">
              <Sparkles className="h-3 w-3" />
              Complete!
            </Badge>
          )}
          {contextMenu}
        </div>
        <CardDescription className="flex flex-wrap gap-2 text-xs">
          {goal.recurrence && goal.recurrence !== "none" && (
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              {goal.recurrence}
            </span>
          )}
          {deadlineStatus && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? "text-destructive" : ""
              }`}
            >
              <Calendar className="h-3 w-3" />
              {deadlineStatus}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className={"space-y-2"}>
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">
                {formatAmount(goal.current_amount)}
              </span>
              <span className="text-muted-foreground">
                / {formatAmount(goal.target_amount)}
              </span>
            </div>
            <span className="font-medium">{Math.round(percentage)}%</span>
          </div>
          <Progress
            value={Math.min(percentage, 100)}
            className="h-4"
            style={
              {
                "--progress-background": goal.color,
              } as React.CSSProperties
            }
          />
        </div>

        {footer}
      </CardContent>
    </Card>
  );
}
