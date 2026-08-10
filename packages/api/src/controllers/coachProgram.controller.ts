import type { Request, Response, NextFunction } from "express";
import { coachProgramService } from "../services/coachProgram.service";

const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const program = await coachProgramService.createDraft(
      req.user!.userId,
      req.body,
    );
    res.status(201).json({ data: program });
  } catch (err) {
    next(err);
  }
};

const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const programs = await coachProgramService.listForCoach(req.user!.userId);
    res.json({ data: programs });
  } catch (err) {
    next(err);
  }
};

const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { programId } = req.params;
    const program = await coachProgramService.getDetail(
      programId as string,
      req.user!.userId,
    );
    res.json({ data: program });
  } catch (err) {
    next(err);
  }
};

const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { programId } = req.params;
    const program = await coachProgramService.updateMeta(
      programId as string,
      req.user!.userId,
      req.body,
    );
    res.json({ data: program });
  } catch (err) {
    next(err);
  }
};

const upsertDay = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { programId, dayNumber } = req.params as unknown as {
      programId: string;
      dayNumber: number;
    };
    const program = await coachProgramService.upsertDay(
      programId,
      req.user!.userId,
      dayNumber,
      req.body,
    );
    res.json({ data: program });
  } catch (err) {
    next(err);
  }
};

const publish = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { programId } = req.params;
    const program = await coachProgramService.publish(
      programId as string,
      req.user!.userId,
    );
    res.json({ data: program });
  } catch (err) {
    next(err);
  }
};

export const coachProgramController = {
  create,
  list,
  getOne,
  update,
  upsertDay,
  publish,
};
