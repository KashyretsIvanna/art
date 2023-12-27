export interface DataFromCordsRes {
  results: AddressComponentsRes[];
  status: string;
}

interface AddressComponentsRes {
  address_components: AddressPartRes[];
  formatted_address: string;
}

interface AddressPartRes {
  long_name: string;
  short_name: string;
  types: string[];
}
