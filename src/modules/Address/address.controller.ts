import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AddressService } from "./address.service";
import { AddressValidations } from "./address.validation";
import { requireParam } from "../../utils/requireParam";

const createAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  
  // Validate request body
  const validated = AddressValidations.createAddressValidationSchema.parse({
    body: req.body,
  });

  const result = await AddressService.createAddress(userId, validated.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Address created successfully",
    data: result,
  });
});

const getMyAddresses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await AddressService.getMyAddresses(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Addresses retrieved successfully",
    data: result,
  });
});

const getAddressById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const id = requireParam(req.params.id, "id");
  const result = await AddressService.getAddressById(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Address retrieved successfully",
    data: result,
  });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const id = requireParam(req.params.id, "id");

  // Validate request body
  const validated = AddressValidations.updateAddressValidationSchema.parse({
    body: req.body,
  });

  const result = await AddressService.updateAddress(userId, id, validated.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Address updated successfully",
    data: result,
  });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const id = requireParam(req.params.id, "id");
  await AddressService.deleteAddress(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Address deleted successfully",
    data: null,
  });
});

const getAreas = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.getAreas();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Areas retrieved successfully",
    data: result,
  });
});

export const AddressController = {
  createAddress,
  getMyAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  getAreas,
};
