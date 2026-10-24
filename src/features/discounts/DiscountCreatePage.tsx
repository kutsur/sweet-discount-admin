import { Box } from "@mui/material";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { PageHeader } from "../../components/layout/PageHeader";
import { PlacePicker } from "../places/PlacePicker";
import { DiscountForm, type DiscountPayload } from "./DiscountForm";
import { useCreateDiscount } from "./queries";

/** Creates a discount for one place — fixed at creation, pre-filled from ?place_id=. */
export function DiscountCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createDiscount = useCreateDiscount();

  const [placeId, setPlaceId] = useState(searchParams.get("place_id") ?? "");
  const [placeError, setPlaceError] = useState<string | null>(null);

  const submit = async (payload: DiscountPayload) => {
    setPlaceError(null);
    if (!placeId) {
      setPlaceError("Выберите заведение, в котором действует скидка.");
      return;
    }
    const discount = await createDiscount.mutateAsync({ ...payload, place_id: placeId });
    navigate(`/discounts/${discount.id}`, { replace: true });
  };

  return (
    <Box sx={{ maxWidth: 760 }}>
      <PageHeader title="Новая скидка" subtitle="Покупатели увидят её у заведения в выбранные дни и часы." />
      <DiscountForm
        submitLabel="Создать скидку"
        onSubmit={submit}
        onFieldError={(_field, message) => {
          setPlaceError(message);
          return true;
        }}
        header={
          <PlacePicker
            autoSelectSingle
            value={placeId}
            onChange={(id) => {
              setPlaceId(id);
              setPlaceError(null);
            }}
            error={placeError}
            helperText="Скидка привязана к одному заведению, перенести её потом нельзя."
          />
        }
      />
    </Box>
  );
}
