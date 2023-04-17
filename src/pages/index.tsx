import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { Github, Twitter } from "lucide-react";

import { ChatGPTEditor } from "../sections/ChatGPTEditor";
import { EncoderSelect } from "~/sections/EncoderSelect";
import { TokenViewer } from "~/sections/TokenViewer";
import { Button } from "~/components/Button";
import { TextArea } from "~/components/Input";
import {
  encoding_for_model,
  get_encoding,
  type TiktokenModel,
  type TiktokenEncoding,
} from "@dqbd/tiktoken";

const decoder = new TextDecoder();

function getUserSelectedEncoder(
  params: { model: TiktokenModel } | { encoder: TiktokenEncoding }
) {
  if ("model" in params) {
    if (
      params.model === "gpt-4" ||
      params.model === "gpt-4-32k" ||
      params.model === "gpt-3.5-turbo"
    ) {
      return encoding_for_model(params.model, {
        "<|im_start|>": 100264,
        "<|im_end|>": 100265,
        "<|im_sep|>": 100266,
      });
    }

    return encoding_for_model(params.model);
  }

  if ("encoder" in params) {
    return get_encoding(params.encoder);
  }

  throw new Error("Invalid params");
}

const Home: NextPage = () => {
  const [text, setText] = useState<string>("");
  const [params, setParams] = useState<
    { model: TiktokenModel } | { encoder: TiktokenEncoding }
  >({ model: "gpt-3.5-turbo" });
  const [showMore, setShowMore] = useState(false);

  const [encoder, setEncoder] = useState(() => getUserSelectedEncoder(params));

  const tokens = encoder.encode(text, "all");
  const segments = Array(tokens.length)
    .fill(0)
    .map((_, i) =>
      decoder.decode(encoder.decode_single_token_bytes(tokens[i] ?? 0))
    );

  const data = {
    encoding: tokens.filter(
      (_, idx) => !(idx > 0 && (tokens[idx - 1] ?? 0) >= 900000)
    ),
    segments: segments
      .map((i, idx) => {
        if ((tokens[idx] ?? 0) >= 900000) return `${i}${segments[idx + 1]}`;
        return i;
      })
      .filter((_, idx) => !(idx > 0 && (tokens[idx - 1] ?? 0) >= 900000)),
  };

  return (
    <>
      <Head>
        <title>Tiktokenizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-4 p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-bold">Tiktokenizer - 中文版</h1>

          <Button
            onClick={() => {
              setShowMore((prev) => !prev);
            }}
            variant={"subtle"}
            size={"sm"}
          >
            高级设置
          </Button>

          <EncoderSelect
            value={params}
            onChange={(update) => {
              setEncoder((encoder) => {
                encoder.free();
                return getUserSelectedEncoder(update);
              });

              setParams(update);
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex flex-col gap-4">
            {"model" in params &&
              (params.model === "gpt-3.5-turbo" ||
                params.model === "gpt-4" ||
                params.model === "gpt-4-32k") && (
                <ChatGPTEditor model={params.model} onChange={setText} />
              )}

            {showMore && (
              <TextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[256px] rounded-md border p-4 font-mono shadow-sm"
              />
            )}

            {data.encoding.find((i) => i >= 900_000) && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Note</span>: Using a placeholder
                token value (eg. 900000) for the name field.
              </p>
            )}

            {"model" in params &&
              (params.model === "gpt-4" || params.model === "gpt-4-32k") && (
                <p className="text-sm text-slate-400">
                  算法参考了这个{" "}
                  <a
                    href="https://news.ycombinator.com/item?id=34990391"
                    className="text-slate-800"
                  >
                    Hacker News 讨论
                  </a>
                  .
                </p>
              )}
          </section>

          <section className="flex flex-col gap-4">
            <TokenViewer
              showMore={showMore}
              model={"model" in params ? params.model : undefined}
              data={data}
              isFetching={false}
            />
          </section>
        </div>
        <style jsx>
          {`
            .diagram-link:hover > span {
              margin-left: 0;
            }

            .diagram-link > svg {
              opacity: 0;
              transform: scale(0.8);
            }
            .diagram-link:hover > svg {
              opacity: 1;
              transform: scale(1);
            }
          `}
        </style>
        {showMore && (
          <div className="flex justify-between text-center md:mt-6">
            <p className=" text-sm text-slate-400">
              Built by{" "}
              <a
                target="_blank"
                rel="noreferrer"
                className="text-slate-800"
                href="https://duong.dev"
              >
                dqbd
              </a>
              . 由{" "}
              <a
                target="_blank"
                rel="noreferrer"
                className="text-slate-800"
                href="https://api2d.com/"
              >
                API2D
              </a>{" "}
              汉化 | Created with the generous help from{" "}
              <a
                target="_blank"
                rel="noreferrer"
                className="diagram-link text-slate-800"
                href="https://diagram.com"
              >
                <svg
                  width="20"
                  height="20"
                  className="inline-flex align-top transition-all"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM10.9969 16.8033C14.3214 16.3204 16.875 13.4584 16.875 10C16.875 6.5416 14.3214 3.67963 10.9969 3.19674C10.7004 3.15368 10.5521 3.13215 10.3988 3.19165C10.2758 3.23941 10.1459 3.35182 10.0809 3.46672C10 3.60986 10 3.78158 10 4.125V15.875C10 16.2184 10 16.3901 10.0809 16.5333C10.1459 16.6482 10.2758 16.7606 10.3988 16.8084C10.5521 16.8679 10.7004 16.8463 10.9969 16.8033Z"
                    fill="currentColor"
                  />
                </svg>{" "}
                <span className="ml-[-23px] transition-all">Diagram.</span>
              </a>
            </p>

            <div className="flex items-center gap-4">
              <a
                target="_blank"
                rel="noreferrer"
                className="text-slate-800"
                href="https://github.com/dqbd/tiktokenizer"
              >
                <Github />
              </a>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
