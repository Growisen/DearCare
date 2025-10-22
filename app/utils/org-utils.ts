export function getOrgMappings(organization: string) {
  let nursesOrg: string;
  let clientsOrg: string;

  switch (organization) {
    case "DearCare":
      nursesOrg = "Dearcare_Llp";
      clientsOrg = "DearCare LLP";
      break;
    case "TataHomeNursing":
      nursesOrg = "Tata_Homenursing";
      clientsOrg = "Tata HomeNursing";
      break;
    default:
      nursesOrg = organization;
      clientsOrg = organization;
  }

  return { nursesOrg, clientsOrg };
}