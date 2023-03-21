
export const getPartnerInfo = (partners,email) => {
    let result = partners.find(partner => partner.email !== email);
    return result;
}