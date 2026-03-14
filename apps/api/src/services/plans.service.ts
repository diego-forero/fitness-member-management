import { listActivePlans } from "../repositories/plans.repository";

export async function listPlansService() {
  return listActivePlans();
}