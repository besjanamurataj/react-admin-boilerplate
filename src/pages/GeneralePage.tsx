import { Select } from "../components/ui/Select";
import { Tooltip } from "../components/ui/Tooltip";
import { Button } from "../components/ui/Button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs";
import { Switch } from "../components/ui/Switch";
import { useState } from "react";
import { Spinner } from "../components/ui/Spinner";
import { Progress } from "../components/ui/Progress";
import { Checkbox } from "../components/ui/Checkbox";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/Alert";
import { Accordion, AccordionItem } from "../components/ui/Accordion";
import { DatePicker } from "../components/ui/DatePicker";

export const GeneralPage = () => {
  const [switchValue, setSwitchValue] = useState<boolean>(true);
  const [checked, setChecked] = useState<boolean>(true);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const currentDate: Date = new Date();

  const technologies: string[] = ["React", "TypeScript", "Tailwind CSS"];

  return (
    <div className=" p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 justify-items justify-content gap-3  p-4">
        <div>
          <Checkbox checked={checked} onCheckedChange={setChecked} />
        </div>

        <div>
          <Tooltip
            title="This is a tooltip"
            content={"Tooltip content goes here"}
          >
            <Button variant="outline">Hover me</Button>
          </Tooltip>
        </div>

        <div>
          <Alert>
            <AlertTitle>Info Alert</AlertTitle>

            <AlertDescription>This is an informational alert.</AlertDescription>
          </Alert>
        </div>

        <div>
          <Alert variant="destructive">
            <AlertTitle>Error Alert</AlertTitle>

            <AlertDescription>This is a destructive alert.</AlertDescription>
          </Alert>
        </div>

        <div>
          <Accordion>
            <AccordionItem title={"Accordion Title"}>
              <div>hello world</div>
            </AccordionItem>
          </Accordion>
        </div>

        <div>
          <Tabs defaultValue={"tab1"}>
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>

            <TabsContent value="tab1">
              <p>Content for Tab 1</p>
            </TabsContent>

            <TabsContent value="tab2">
              <p>Content for Tab 2</p>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Select
            options={[
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
              { label: "Option 3", value: "option3" },
            ]}
          />
        </div>

        <div className="p-6">
          <Switch checked={switchValue} onCheckedChange={setSwitchValue} />
        </div>

        <div>
          <Spinner
            variant="determinate"
            value={75}
            size={99}
            strokeWidth={6}
            color="#4A90E2"
            description="Loading..."
          />
        </div>

        <div>
          <Progress value={50} className="w-48 bg-gray-200" color={"blue"} />
        </div>
      </div>

      <section className="mt-10 border-t-2 border-gray-300 pt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Additional TypeScript Data Types
          </h2>

          <p className="text-sm text-gray-500">
            Examples of additional data types displayed in the frontend.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border p-4">
            <h3 className="mb-4 font-semibold">Date</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium">Current date</h4>

                <p>{currentDate.toLocaleDateString()}</p>

                <p className="text-sm text-gray-500">
                  {currentDate.toLocaleTimeString()}
                </p>
              </div>

              <div>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  label="Select a date"
                  placeholder="Choose date"
                  yearRange={{
                    from: 1970,
                    to: new Date().getFullYear() + 10,
                  }}
                />

                <div className="mt-3 text-sm">
                  <span className="font-medium">Selected date: </span>

                  <span>
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "No date selected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="mb-2 font-semibold">String Array</h3>

            <ul className="list-inside list-disc">
              {technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
