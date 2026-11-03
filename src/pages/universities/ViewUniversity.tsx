import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getUniversityById } from "../../services/universityService";
import { useTranslation } from "react-i18next";
import type {
  UniversityRequest,
  UniversityResponse,
} from "../../types/university";

export const ViewUniversityPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();

  const { data } = useQuery<UniversityResponse>({
    queryKey: ["universities", params.id],
    queryFn: ({ signal }) => {
      if (!params?.id) throw new Error("No ID provided");

      return getUniversityById({
        id: params.id,
        signal,
      });
    },
    enabled: !!params?.id,
  });

  const university = data as unknown as UniversityRequest | undefined;
  const displayedFormData: UniversityRequest = {
    name: university?.name ?? "",
    code: university?.code ?? "",
    city: university?.city ?? "",
    email: university?.email ?? "",
  };

  return (
    <div className="p-6">
      <PageTitle
        title={t("universities.viewTitle")}
        subTitle={t("universities.viewDescription") || ""}
      />

      <form>
        <div className="grid grid-cols-12 gap-6 mt-4">
          <div className="col-span-6">
            <Label
              htmlFor="name"
              className="block text-md font-medium text-gray-700"
            >
              {t("universities.table.name")}
            </Label>

            <Input
              id="name"
              value={university?.name}
              placeholder={t("displayedFormData.namePlaceholder") || ""}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="code"
              className="block text-md font-medium text-gray-700"
            >
              {t("universities.table.code")}
            </Label>

            <Input
              id="code"
              value={displayedFormData?.code}
              placeholder={t("universities.codePlaceholder") || ""}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="city"
              className="block text-md font-medium text-gray-700"
            >
              {t("universities.table.city")}
            </Label>

            <Input
              id="city"
              value={displayedFormData?.city}
              placeholder={t("universities.cityPlaceholder") || ""}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="email"
              className="block text-md font-medium text-gray-700"
            >
              {t("universities.table.email")}
            </Label>

            <Input
              id="email"
              value={displayedFormData?.email}
              placeholder={t("universities.emailPlaceholder") || ""}
              disabled
            />
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => navigate("/university")}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ViewUniversityPage;
