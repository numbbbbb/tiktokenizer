import { Fragment, useState } from "react";
import { cn } from "~/utils/cn";

import BN from "bignumber.js";
import { Checkbox } from "~/components/Checkbox";

const COLORS = [
  "bg-sky-200",
  "bg-amber-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-orange-200",
  "bg-cyan-200",
  "bg-gray-200",
  "bg-purple-200",
  "bg-indigo-200",
  "bg-lime-200",
  "bg-rose-200",
  "bg-violet-200",
  "bg-yellow-200",
  "bg-emerald-200",
  "bg-zinc-200",
  "bg-red-200",
  "bg-fuchsia-200",
  "bg-pink-200",
  "bg-teal-200",
];

const PRICING: Record<string, BN> = {
  "gpt-4": BN("0.03").div(1000),
  "gpt-4-32k": BN("0.03").div(1000),
  "gpt-3.5-turbo": BN("0.002").div(1000),
  "text-embedding-ada-002": BN("0.0004").div(1000),
};

const API2DP: Record<string, BN> = {
  "gpt-4": BN("30").div(100),
  "gpt-4-32k": BN("60").div(100),
  "gpt-3.5-turbo": BN("1").div(100),
  "text-embedding-ada-002": BN("1").div(500),
};

const PToMaxToken: Record<string, BN> = {
  "gpt-4": BN("100").div(30),
  "gpt-4-32k": BN("100").div(60),
  "gpt-3.5-turbo": BN("100"),
  "text-embedding-ada-002": BN("500"),
};

function encodeWhitespace(str: string) {
  let result = str;

  result = result.replaceAll(" ", "⋅");
  result = result.replaceAll("\t", "→");
  result = result.replaceAll("\f", "\\f\f");
  result = result.replaceAll("\b", "\\b\b");
  result = result.replaceAll("\v", "\\v\v");

  result = result.replaceAll("\r", "\\r\r");
  result = result.replaceAll("\n", "\\n\n");
  result = result.replaceAll("\\r\r\\n\n", "\\r\\n\r\n");

  return result;
}

export function TokenViewer(props: {
  isFetching: boolean;
  showMore: boolean;
  model: string | undefined;
  data:
    | Array<{ text: string; tokens: { id: number; idx: number }[] }>
    | undefined;
}) {
  const [indexHover, setIndexHover] = useState<null | number>(null);
  const [p, setP] = useState<number>(1000);

  const tokenCount =
    props.data?.reduce((memo, i) => memo + i.tokens.length, 0) ?? 0;
  const pricing = props.model != null ? PRICING[props.model] : undefined;

  const api2dP = props.model != null ? API2DP[props.model] : undefined;
  const showMore = props.showMore;
  const [showWhitespace, setShowWhitespace] = useState(false);

  return (
    <>
      <div className="flex gap-4">
        <div className="flex-grow rounded-md border bg-slate-50 p-4 shadow-sm">
          <p className="text-sm ">Token 统计</p>
          <p className="text-lg">{tokenCount}</p>
        </div>

        {pricing != null && (
          <div className="flex-grow rounded-md border bg-slate-50 p-4 shadow-sm">
            <p className="text-sm ">Prompt 费用总计</p>
            <p className="text-lg">
              ${pricing?.multipliedBy(tokenCount)?.toFixed()}
            </p>
          </div>
        )}

        {api2dP != null && (
          <div className="flex-grow rounded-md border bg-slate-50 p-4 shadow-sm">
            <p className="text-sm ">
              <a
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                href="https://api2d.com/"
              >
                API2D
              </a>{" "}
              P数
            </p>
            <p className="text-lg">
              {Math.max(
                Math.ceil(api2dP.multipliedBy(tokenCount)?.toNumber()),
                1
              )}
              P
            </p>
          </div>
        )}
      </div>

      {api2dP != null && (
        <div className="flex flex-grow flex-row justify-center rounded-md border bg-slate-50 p-4 shadow-sm">
          <div className="flex basis-1/3 flex-col justify-center">
            <span className="text-right ">API2D 余额（P）</span>
            <input
              className="mt-4 flex h-10 rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
              value={p}
              onChange={(e) => setP(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex basis-1/5 flex-row flex-wrap content-center justify-center">
            =
          </div>
          <div className="content-left flex basis-1/3 flex-col flex-wrap justify-center ">
            <span className=" font-bold">
              {Math.ceil(
                PToMaxToken[props.model!]!.multipliedBy(p)?.toNumber()
              )}
            </span>
            <span className="">{props.model}</span>
            <span>tokens</span>
            <span>余额不多的情况下，可以对照这个设置 max_tokens</span>
          </div>
        </div>
      )}

      {showMore && (
        <pre className="min-h-[256px] max-w-[100vw] overflow-auto whitespace-pre-wrap break-all rounded-md border bg-slate-50 p-4 shadow-sm">
          {props.data?.map(({ text }, idx) => (
            <span
              key={idx}
              onMouseEnter={() => setIndexHover(idx)}
              onMouseLeave={() => setIndexHover(null)}
              className={cn(
                "transition-all",
                (indexHover == null || indexHover === idx) &&
                  COLORS[idx % COLORS.length],
                props.isFetching && "opacity-50"
              )}
            >
              {showWhitespace || indexHover === idx
                ? encodeWhitespace(text)
                : text}
            </span>
          ))}
        </pre>
      )}

      {showMore && (
        <pre
          className={
            "min-h-[256px] max-w-[100vw] overflow-auto whitespace-pre-wrap break-all rounded-md border bg-slate-50 p-4 shadow-sm"
          }
        >
          {props.data && tokenCount > 0 && (
            <span
              className={cn(
                "transition-opacity",
                props.isFetching && "opacity-50"
              )}
            >
              [
              {props.data.map((segment, segmentIdx) => (
                <Fragment key={segmentIdx}>
                  {segment.tokens.map((token) => (
                    <Fragment key={token.idx}>
                      <span
                        onMouseEnter={() => setIndexHover(segmentIdx)}
                        onMouseLeave={() => setIndexHover(null)}
                        className={cn(
                          "transition-colors",
                          indexHover === segmentIdx &&
                            COLORS[segmentIdx % COLORS.length]
                        )}
                      >
                        {token.id}
                      </span>
                      <span className="last-of-type:hidden">{", "}</span>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
              ]
            </span>
          )}
        </pre>
      )}

      {showMore && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={showWhitespace}
            onClick={() => setShowWhitespace((v) => !v)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            显示空白字符
          </label>
        </div>
      )}
    </>
  );
}
