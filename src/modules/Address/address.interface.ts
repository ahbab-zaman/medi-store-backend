export type TAddressPayload = {
  name: string;
  firstname: string;
  lastname: string;
  address_1: string;
  address_2: string;
  road: string;
  area?: string | null;
  landmark?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  mobile_country_code?: string;
  mobile: string;
  default?: number; // 0 or 1 from client
};
