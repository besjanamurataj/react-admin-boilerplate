import {
  Bell,
  Clock,
  DollarSign,
  EllipsisVertical,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  User,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { PageTitle } from "../components/PageTitle";
import SimpleAreaChart from "../components/ui/chart/AreaChart";
import { LineChartComponent } from "../components/ui/chart/LineChart";
import { Line } from "recharts";
import { PieChartComponent } from "../components/ui/chart/PieChart";
import type { ChartConfig } from "../components/ui/chart/ChartContainer";
import { BarChartComponent } from "../components/ui/chart/BarChart";
import { useTranslation } from "react-i18next";

const cardsItems = [
  {
    title: "Accounts to review today",
    value: "2.8K",
    icon: User,

    total: true,
    percentIncrease: 4.2,
  },
  {
    title: "Highest Risk by MRR",
    value: "127",
    icon: TriangleAlert,
    total: false,
    percentIncrease: -8,
    account: "Acme Corp",
    mrr: "$24,000",
    risk: "High",
  },
  {
    title: "Renewals at risk (30d)",
    value: "84.6K",
    icon: DollarSign,
    total: false,
    percentIncrease: 15,
  },

  {
    title: "Expected Churn MRR (30d)",
    value: "8.8K",
    icon: TrendingUp,
    total: false,
    percentIncrease: +2.1,
  },
];
const keyRiskDrivers = [
  { name: "Login Frequency", change: -12 },
  { name: "Feature Adoption", change: -8 },
  { name: "Support Tickets", change: +5 },
];
const recentNotifications = [
  {
    title: "Usage Drop",
    message: "Weekly active users decreased by 35% compared to last month",
    time: "2 hours ago",
    user: "Acme Corp",
    status: "warning",
  },
  {
    title: "Payment Failed",
    message: "Invoice #1234 payment failed after 3 retry attempts",
    time: "4 hours ago",
    user: "TechStart Inc",
    status: "error",
  },
];

const reviewAccounts = {
  name: "Acme Corp",
  score: 85,
  band: "High",
  topDrivers: ["Usage", "Engagement"],
  mrr: 12000,
  renewalInDays: 25,
  owner: "Jane Doe",
};

const biggestItems = [
  { id: "1", name: "Acme Corp", scoreDrop: 18, risk: "high" },
  { id: "2", name: "Globex Ltd", scoreDrop: 12, risk: "medium" },
  { id: "3", name: "Initech", scoreDrop: 9 },
];
const bandStyles: Record<string, string> = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-800",
};

const data = [
  { name: "Page A", uv: 4000 },
  { name: "Page B", uv: 3000 },
  { name: "Page C", uv: 3200 },
  { name: "Page D", uv: 2800 },
  { name: "Page E", uv: 3500 },
  { name: "Page F", uv: 2800 },
  { name: "Page G", uv: 3500 },
];

const lineChartData = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const pieChartData = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

export const HomePage = () => {
  const { t } = useTranslation();
  return (
    <div className=" p-6">
      <div className="flex  justify-between  items-center">
        <PageTitle
          title={t("home.title")}
          subTitle={t("home.description") || ""}
        />
        {/* <div>
          <Button variant="outline" size="lg" className="my-4 bg-green-600 rounded-xl text-white">
            <Activity />
            View Reports
          </Button>
        </div> */}
      </div>

      <div className=" gap-4  grid w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {cardsItems.map((item, index) => {
          const trendDirection = item.percentIncrease < 0 ? true : false;
          return (
            <Card
              key={index}
              className={`relative w-full overflow-hidden ${
                item.total
                  ? "bg-gradient-to-br from-[rgba(78,161,88,1)] to-[rgba(62,132,71,1)]"
                  : "bg-white"
              }`}
            >
              <CardContent className="relative w-full">
                <span className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-green-50 opacity-70"></span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-green-100 hover:bg-green-100 p-2 mb-3 relative z-10"
                >
                  <item.icon className="h-6 w-6 text-green-600" />
                </Button>

                <div
                  className={`${item.total ? "text-white" : "text-gray-500 font-medium"} relative z-10`}
                >
                  <h1 className="text-sm">{item.title}</h1>
                  <h1
                    className={`text-2xl font-bold ${item.total ? "text-white" : "text-black"}`}
                  >
                    {item.value}
                  </h1>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-foreground">
                      {item.account}
                    </span>
                    <span className="font-medium text-foreground">
                      {item.mrr}
                    </span>
                    {item.risk && (
                      <Badge
                        className={
                          bandStyles[item.risk] ?? "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.risk}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <Badge
                      className={
                        trendDirection
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }
                    >
                      {trendDirection ? (
                        <TrendingDown className="inline h-4 w-4 mr-1" />
                      ) : (
                        <TrendingUp className="inline h-4 w-4 mr-1" />
                      )}
                      {item.percentIncrease}%
                    </Badge>
                    <span className="text-gray-400 text-sm">vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="my-4">
        <CardContent>
          <div className="flex gap-2 items-center pb-2">
            <TriangleAlert className="text-orange-500" />
            <h1 className="text-lg font-semibold"> Accounts to Review</h1>
          </div>
          <div className="flex gap-2 items-center mb-4">
            <div className="flex items-center">
              <User size={18} />
              <span className="font-medium text-foreground">
                {reviewAccounts.name}
              </span>
            </div>
            <span className="font-medium text-foreground">
              {reviewAccounts.score}
            </span>
            <Badge
              className={
                bandStyles[reviewAccounts.band] ?? "bg-gray-100 text-gray-800"
              }
            >
              {reviewAccounts.band}
            </Badge>
            <span className="font-medium text-foreground">
              {reviewAccounts.topDrivers.join(", ")}
            </span>
            <span className="font-medium text-foreground">
              ${reviewAccounts.mrr.toLocaleString()}
            </span>
            <span className="font-medium text-foreground">
              {reviewAccounts.renewalInDays}
            </span>
            <span className="font-medium text-foreground">
              {reviewAccounts.owner}
            </span>
          </div>
          <div className="flex gap-4">
            <Button variant={"outline"}>View account</Button>
            <Button className="bg-green-700 hover:bg-green-700 text-white">
              Start playbook
            </Button>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
            <BarChartComponent
              data={chartData}
              chartConfig={chartConfig}
              className="max-w-[700px]"
            />
            <SimpleAreaChart
              data={data}
              dataKey="uv"
              className="max-w-[700px]"
            />
            <PieChartComponent data={pieChartData} />
            <LineChartComponent data={lineChartData} dataKey="uv">
              <Line
                type="monotone"
                dataKey="pv"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="uv" stroke="#51acf1" />
            </LineChartComponent>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <Card className="my-4">
          <CardContent>
            <h1 className="text-lg font-semibold">Portfolio Overview</h1>
            <div className="flex justify-between py-4">
              <div>
                <Badge className="bg-orange-100 text-orange-800 border-2 border-gray-200 mr-2">
                  At Risk
                </Badge>
                <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600 font-semibold">+5.2 pts</span>
              </div>
              <RefreshCw />
            </div>

            <div className="py-2 flex flex-wrap ">
              {keyRiskDrivers.map((driver, index) => {
                const driverColor = driver.change < 0 ? "red" : "green";
                return (
                  <Badge
                    key={index}
                    className={`bg-${driverColor}-100 text-${driverColor}-800 flex mb-3 mr-3 `}
                  >
                    {driverColor === "red" ? (
                      <TrendingDown className="pr-1" />
                    ) : (
                      <TrendingUp className="pr-1" />
                    )}{" "}
                    {driver.name} {driver.change}%
                  </Badge>
                );
              })}
            </div>

            <div className="flex justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <h1 className="text-sm text-gray-800 font-semibold">
                  Biggest movers
                </h1>

                {biggestItems.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between cursor-pointer rounded-md p-2 hover:bg-muted">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1 text-destructive font-medium">
                          <TrendingDown className="h-4 w-4" />
                          <span>-{item.scoreDrop}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className=" flex justify-end ">
                  <Button variant="link">View all</Button>
                </div>
              </div>

              <div className="text-gray-500">
                <h1>Last Updated</h1>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-4 w-4" />{" "}
                  <span className="pl-1 font-normal">2 hours ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="my-4">
          <CardContent>
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-gray-500 h-4 w-4" />
                <h1 className="font-bold text-md">Review</h1>
                <Badge className="bg-red-100 text-red-800">
                  {recentNotifications.length}
                </Badge>
              </div>
              <Button variant="link">View All</Button>
            </div>
            {recentNotifications.map((notification) => (
              <Card className="my-4 shadow-md">
                <CardContent className="mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex">
                      <Button
                        size="sm"
                        className={
                          notification.status === "warning"
                            ? "bg-orange-100/90 text-orange-800 hover:bg-orange-100/90"
                            : "bg-red-100/100 text-red-800 hover:bg-red-100/100"
                        }
                      >
                        <TriangleAlert />
                      </Button>
                      <div className="grid  sm:grid-cols-1 md:grid-cols-1 lg:grid-cols- pl-3  w-full gap-4  p-4 rounded-md">
                        <h1 className="text-lg font-semibold">
                          {notification.title}
                        </h1>
                        <div className="grid cols-1">
                          <h1>{notification.message}</h1>
                        </div>
                        <div className="flex justify-start gap-2 items-center">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-600">
                              {notification.user}
                            </span>
                          </div>
                          <Badge className="bg-red-100 text-red-800">
                            Open
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-600">
                              {notification.time}
                            </span>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2  p-4  rounded-md">
                          <Button variant="outline">Acknowledge</Button>
                          <Button
                            size="lg"
                            className="bg-green-700  hover:bg-green-700 text-white"
                          >
                            Start playbook{" "}
                          </Button>
                          <Button variant="outline" size="lg">
                            {/* <AlarmClock /> */}
                            Snooze{" "}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <EllipsisVertical />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default HomePage;
