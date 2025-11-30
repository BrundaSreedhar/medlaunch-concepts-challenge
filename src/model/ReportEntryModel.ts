import { IReportEntryModel } from "../interface/IReportEntryModel";
import { DBUtil } from "../utils/DatabaseUtil";

export class ReportEntryModel {
  private readonly filename = 'reportentries.json';

  //Retrieve all report entries
  public async retrieveAllReportEntries(): Promise<IReportEntryModel[]> {
    return await DBUtil.readFile(this.filename);
  }

  //Retrieve all report entries for a specific report
  public async retrieveReportEntriesByReport(reportId: string): Promise<IReportEntryModel[]> {
    const entries = await DBUtil.readFile(this.filename);
    return entries.filter(
      (entry: IReportEntryModel) => entry.reportId === reportId
    );
  }

  //Retrieve a specific report entry by id
  public async retrieveReportEntry(reportEntryId: string): Promise<IReportEntryModel | null> {
    const entries = await DBUtil.readFile(this.filename);
    return entries.find(
      (entry: IReportEntryModel) => entry.reportEntryId === reportEntryId
    ) || null;
  }

  //Create a new report entry
  public async createReportEntry(reportEntry: IReportEntryModel): Promise<IReportEntryModel> {
    // Verify report exists
    const reports = await DBUtil.readFile('reports.json');
    const report = reports.find((r: any) => r.reportId === reportEntry.reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    const entries = await DBUtil.readFile(this.filename);
    entries.push(reportEntry);
    await DBUtil.writeFile(this.filename, entries);
    return reportEntry;
  }

  //Update a report entry
  public async updateReportEntry(reportEntryId: string, reportEntryData: Partial<IReportEntryModel>): Promise<IReportEntryModel> {
    const entries = await DBUtil.readFile(this.filename);
    const entryIndex = entries.findIndex(
      (entry: IReportEntryModel) => entry.reportEntryId === reportEntryId
    );

    if (entryIndex === -1) {
      throw new Error('Report entry not found');
    }

    // Preserve the reportEntryId and reportId
    const existingEntry = entries[entryIndex];
    const updatedEntry: IReportEntryModel = {
      ...existingEntry,
      ...reportEntryData,
      reportEntryId: existingEntry.reportEntryId,
      reportId: existingEntry.reportId
    };

    entries[entryIndex] = updatedEntry;
    await DBUtil.writeFile(this.filename, entries);
    return updatedEntry;
  }

  //Delete a report entry
  public async deleteReportEntry(reportEntryId: string): Promise<void> {
    const entries = await DBUtil.readFile(this.filename);
    const entryIndex = entries.findIndex(
      (entry: IReportEntryModel) => entry.reportEntryId === reportEntryId
    );

    if (entryIndex === -1) {
      throw new Error('Report entry not found');
    }

    entries.splice(entryIndex, 1);
    await DBUtil.writeFile(this.filename, entries);
  }
}
