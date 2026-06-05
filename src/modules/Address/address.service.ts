import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { TAddressPayload } from "./address.interface";

const createAddress = async (userId: string, payload: TAddressPayload) => {
  const isDefault = payload.default === 1;

  if (isDefault) {
    // Unset other default addresses for this user
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const result = await prisma.address.create({
    data: {
      userId,
      name: payload.name,
      firstname: payload.firstname,
      lastname: payload.lastname,
      address_1: payload.address_1,
      address_2: payload.address_2,
      road: payload.road,
      area: payload.area || "",
      landmark: payload.landmark || null,
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
      mobileCountryCode: payload.mobile_country_code || "971",
      mobile: payload.mobile,
      isDefault,
    },
  });

  return result;
};

const getMyAddresses = async (userId: string) => {
  const result = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getAddressById = async (userId: string, id: string) => {
  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address) {
    throw new AppError(404, "Address not found");
  }

  if (address.userId !== userId) {
    throw new AppError(403, "You are not authorized to view this address");
  }

  return address;
};

const updateAddress = async (
  userId: string,
  id: string,
  payload: Partial<TAddressPayload>,
) => {
  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address) {
    throw new AppError(404, "Address not found");
  }

  if (address.userId !== userId) {
    throw new AppError(403, "You are not authorized to update this address");
  }

  if (payload.default !== undefined) {
    const isDefault = payload.default === 1;
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
  }

  const updateData: any = {};
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.firstname !== undefined) updateData.firstname = payload.firstname;
  if (payload.lastname !== undefined) updateData.lastname = payload.lastname;
  if (payload.address_1 !== undefined) updateData.address_1 = payload.address_1;
  if (payload.address_2 !== undefined) updateData.address_2 = payload.address_2;
  if (payload.road !== undefined) updateData.road = payload.road;
  if (payload.area !== undefined) updateData.area = payload.area || "";
  if (payload.landmark !== undefined) updateData.landmark = payload.landmark || null;
  if (payload.latitude !== undefined) updateData.latitude = payload.latitude || null;
  if (payload.longitude !== undefined) updateData.longitude = payload.longitude || null;
  if (payload.mobile_country_code !== undefined)
    updateData.mobileCountryCode = payload.mobile_country_code;
  if (payload.mobile !== undefined) updateData.mobile = payload.mobile;
  if (payload.default !== undefined) updateData.isDefault = payload.default === 1;

  const result = await prisma.address.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deleteAddress = async (userId: string, id: string) => {
  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address) {
    throw new AppError(404, "Address not found");
  }

  if (address.userId !== userId) {
    throw new AppError(403, "You are not authorized to delete this address");
  }

  await prisma.address.delete({
    where: { id },
  });

  return null;
};

const getAreas = async () => {
  return [
    { id: "1", name: "Dubai Marina", status: "1" },
    { id: "2", name: "Downtown Dubai", status: "1" },
    { id: "3", name: "Jumeirah", status: "1" },
    { id: "4", name: "Business Bay", status: "1" },
    { id: "5", name: "Deira", status: "1" },
  ];
};

export const AddressService = {
  createAddress,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  getAreas,
};
