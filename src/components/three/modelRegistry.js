import {
  IssuesModel,
  CleanupModel,
  PollsModel,
  AnimalsModel,
  LostFoundModel,
  NoticesModel,
  NgoModel,
  VolunteersModel,
  TrophyModel,
} from "./models";

/** Page header models by key (used by <PageArt3D model="...">) */
export const MODELS = {
  issues: IssuesModel,
  cleanups: CleanupModel,
  polls: PollsModel,
  animals: AnimalsModel,
  lostfound: LostFoundModel,
  notices: NoticesModel,
  ngos: NgoModel,
  volunteers: VolunteersModel,
  trophy: TrophyModel,
};
