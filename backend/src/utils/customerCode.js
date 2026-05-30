export async function nextCustomerCode(prisma) {
  const last = await prisma.customer.findFirst({
    orderBy: { customerCode: 'desc' },
    where: { customerCode: { startsWith: 'CUS' } },
  });
  const num = last
    ? parseInt(last.customerCode.replace('CUS', ''), 10) + 1
    : 1;
  return `CUS${String(num).padStart(4, '0')}`;
}
