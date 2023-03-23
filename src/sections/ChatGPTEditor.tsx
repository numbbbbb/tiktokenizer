import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/Select";
import { X as Close } from "lucide-react";
import { Button } from "~/components/Button";
import { Input, TextArea } from "~/components/Input";

export function ChatGPTEditor(props: {
  model: "gpt-4" | "gpt-4-32k" | "gpt-3.5-turbo";
  onChange: (value: string) => void;
}) {
  const [rows, setRows] = useState<
    { role: string; message: string; name: string }[]
  >([
    { role: "system", message: "假设你是一位英语老师，你需要帮我纠正我的语法错误", name: "" },
    { role: "user", message: "I like drink coffee，这句英语有什么错误？", name: "" },
    { role: "assistant", message: '这句英语中有一个错误。正确的写法应该是：\n"I like to drink coffee."\n在这个句子中，动词"like"后应该接不定式动词"to drink"，而不是直接接动词"drink"。', name: "" },
  ]);

  const changeRef = useRef<(value: string) => void>(props.onChange);

  // not ideal, but will suffice for now
  useEffect(() => void (changeRef.current = props.onChange), [props.onChange]);
  useEffect(() => {
    const isGpt3 = props.model === "gpt-3.5-turbo";
    changeRef.current?.(
      [
        rows
          .map(
            (i) =>
              `<|im_start|>${[i.role === "system-name" ? i.name : i.role]
                .filter(Boolean)
                .join(" ")}${isGpt3 ? "\n" : "<|im_sep|>"}${
                i.message
              }<|im_end|>`
          )
          .join(isGpt3 ? "\n" : ""),
        "<|im_start|>assistant",
      ]
        .filter(Boolean)
        .join(isGpt3 ? "\n" : "")
    );
  }, [props.model, rows]);

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div className="flex flex-col gap-2" key={i}>
          <div className="grid grid-cols-[min-content,1fr,auto] gap-2">
            <Select
              value={row.role}
              onValueChange={(val) =>
                setRows((rows) => {
                  const newRows = [...rows];
                  // @ts-expect-error
                  newRows[i].role = val;
                  return newRows;
                })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">用户</SelectItem>
                <SelectItem value="system">系统</SelectItem>
                <SelectItem value="assistant">助理</SelectItem>
                <SelectSeparator />
                <SelectItem value="system-name">自定义</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-2">
              {row.role === "system-name" && (
                <Input
                  value={row.name}
                  placeholder="名称"
                  onChange={(e) =>
                    setRows((rows) => {
                      const newRows = [...rows];
                      // @ts-expect-error
                      newRows[i].name = e.target.value;
                      return newRows;
                    })
                  }
                />
              )}

              <TextArea
                rows={1}
                value={row.message}
                placeholder="内容"
                onChange={(e) =>
                  setRows((rows) => {
                    const newRows = [...rows];
                    // @ts-expect-error
                    newRows[i].message = e.target.value;
                    return newRows;
                  })
                }
              />
            </div>

            <Button
              variant="subtle"
              className="p-2"
              onClick={() => {
                setRows((rows) => {
                  const newRows = [...rows];
                  newRows.splice(i, 1);
                  return newRows;
                });
              }}
            >
              <Close />
            </Button>
          </div>
        </div>
      ))}
      <Button
        onClick={() =>
          setRows((rows) => {
            let role = "user";

            if (rows.length === 0) {
              role = "system";
            } else if (rows.at(-1)?.role === "user") {
              role = "assistant";
            }

            return [...rows, { role, message: "", name: "" }];
          })
        }
      >
        新增消息
      </Button>
    </div>
  );
}
