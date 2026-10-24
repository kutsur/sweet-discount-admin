/**
 * Russian texts for what the API reports. The API speaks English (its messages are for
 * developers and logs); the admin panel shows Russian, so every error a user can see
 * passes through here — by stable error code, or for a 422 by its detail message.
 */

const CODE_TEXT: Record<string, string> = {
  validation_failed: "Проверьте введённые данные.",
  malformed_body: "Сервер не смог прочитать запрос.",
  invalid_id: "Некорректный идентификатор в адресе.",
  invalid_credentials: "Неверная почта или пароль.",
  email_not_verified: "Сначала подтвердите почту.",
  account_blocked: "Учётная запись заблокирована.",
  unauthenticated: "Сессия истекла. Войдите снова.",
  refresh_token_invalid: "Сессия истекла. Войдите снова.",
  token_invalid: "Ссылка недействительна или устарела.",
  forbidden: "Недостаточно прав для этого действия.",
  self_action_not_allowed: "Это действие нельзя выполнить со своей учётной записью.",
  not_found: "Не найдено.",
  city_not_found: "Город не найден.",
  place_not_found: "Заведение не найдено.",
  discount_not_found: "Скидка не найдена.",
  slug_taken: "Город с таким коротким именем уже существует.",
  payload_too_large: "Файл слишком большой (максимум 5 МБ).",
  rate_limited: "Слишком много попыток. Подождите немного.",
  db_unavailable: "Сервер временно недоступен.",
  internal_error: "Что-то пошло не так. Попробуйте ещё раз.",
  network_error: "Нет связи с сервером. Проверьте подключение.",
};

export const GENERIC_ERROR_TEXT = "Что-то пошло не так. Попробуйте ещё раз.";

/** The Russian text for an API error code, falling back to a generic message. */
export function apiErrorText(code: string): string {
  return CODE_TEXT[code] ?? GENERIC_ERROR_TEXT;
}

/** [pattern over the English detail, Russian text or a builder from the match]. */
const DETAIL_TEXT: [RegExp, string | ((m: RegExpMatchArray) => string)][] = [
  [/title must not be empty/, "Укажите название."],
  [/title must be at most (\d+)/, (m) => `Название — не более ${m[1]} символов.`],
  [/description must be at most (\d+)/, (m) => `Описание — не более ${m[1]} символов.`],
  [/name must not be empty/, "Укажите название."],
  [/reason must not be empty/, "Укажите причину."],
  [/percent_off is required/, "Укажите размер скидки."],
  [/percent_off must be between (\d+) and (\d+)/, (m) => `Размер скидки — от ${m[1]} до ${m[2]}%.`],
  [/ends_on must not be before starts_on/, "Дата окончания не может быть раньше даты начала."],
  [/not a valid YYYY-MM-DD date/, "Некорректная дата."],
  [/not a valid HH:MM time/, "Некорректное время (нужно ЧЧ:ММ)."],
  [/start and end of a window must differ/, "Начало и конец интервала должны отличаться."],
  [/two windows starting at the same time/, "В один день два интервала начинаются в одно время."],
  [/weekday must be between/, "Некорректный день недели."],
  [/at most (\d+) windows/, (m) => `Не более ${m[1]} интервалов в расписании.`],
  [/at most (\d+) categories/, (m) => `Не более ${m[1]} категорий у заведения.`],
  [/unknown category/, "Неизвестная категория."],
  [/this city no longer exists/, "Этот город удалён."],
  [/this place no longer exists/, "Это заведение удалено."],
  [/lat and lon must be provided together/, "Укажите и широту, и долготу."],
  [/lat must be between/, "Широта — от −90 до 90."],
  [/lon must be between/, "Долгота — от −180 до 180."],
  [/phone must be in international format/, "Телефон в международном формате, например +375291234567."],
  [/country_code must be/, "Код страны — две латинские буквы (ISO 3166-1), например BY."],
  [/slug must be/, "Короткое имя — строчные латинские буквы, цифры и дефисы."],
  [/password must be at least (\d+)/, (m) => `Пароль — не менее ${m[1]} символов.`],
  [/image must be at most (\d+)×(\d+) pixels/, (m) => `Изображение — не больше ${m[1]}×${m[2]} пикселей.`],
  [/must be a JPEG or PNG/, "Нужен файл JPEG или PNG."],
  [/image could not be decoded/, "Не удалось прочитать изображение."],
  [/you can only attach images you uploaded/, "Можно прикрепить только изображение, загруженное вами."],
  [/not a known image/, "Изображение не найдено. Загрузите его заново."],
  [/not an active user with role=owner/, "Пользователь не активен или не является владельцем."],
  [/not an active user with role=manager/, "Пользователь не активен или не является менеджером."],
  [/not a known user/, "Пользователь не найден."],
  [/not a known discount (kind|status)/, "Неизвестное значение."],
  [/kind is required/, "Выберите тип скидки."],
  [/not a valid UUID/, "Некорректный идентификатор."],
];

/** The Russian text for a 422's English detail message. */
export function validationText(detail: string): string {
  for (const [pattern, text] of DETAIL_TEXT) {
    const match = detail.match(pattern);
    if (match) return typeof text === "string" ? text : text(match);
  }
  return CODE_TEXT.validation_failed;
}
