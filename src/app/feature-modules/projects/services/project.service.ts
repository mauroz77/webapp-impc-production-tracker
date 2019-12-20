import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project } from '../../../model/bio/project';
import { ConfigAssetLoaderService } from '../../../core/services/config-asset-loader.service';
import { ChangesHistory } from 'src/app/core';
import { ProjectFilter } from '../model/project-filter';
import { Observable } from 'rxjs';
import { Page } from 'src/app/model/page_structure/page';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiServiceUrl;

  constructor(private http: HttpClient, private configAssetLoaderService: ConfigAssetLoaderService) {
    this.configAssetLoaderService.getConfig().then(data => this.apiServiceUrl = data.appServerUrl);
  }


  getAll() {
    return this.http.get<Project[]>(this.apiServiceUrl + '/api/projects');
  }

  getProject(tpn: string) {
    return this.http.get<Project>(this.apiServiceUrl + '/api/projects/' + tpn);
  }

  postProject(newProject: Project) {
    return this.http.post<Project>(this.apiServiceUrl + '/api/projects/', newProject);
  }

  deleteMutagenesisDonor(url: string) {
    return this.http.delete(url);
  }

  getPaginatedProjectSummaries(page: number) {
    return this.http.get<Project[]>(this.apiServiceUrl + '/api/projects?page=' + page);
  }

  public getProjects(filters: ProjectFilter, page: Page): Observable<Project[]> {
    const queryParameters = this.buildQueryParameters(filters, page);
    const url = this.apiServiceUrl + '/api/projects?' + queryParameters;
    console.log('url-->', url);

    return this.http.get<Project[]>(url);
  }

  private buildQueryParameters(filters: ProjectFilter, page: Page): string {
    const query: string[] = [];
    if (page) {
      query.push(this.getPaginationQuery(page));
    }
    query.push(this.getFilterQuery(filters));
    return query.join('&');
  }

  private getFilterQuery(filters: ProjectFilter) {
    const filterParameters = [];
    if (filters) {
      Object.keys(filters).map(key => {
        const content = filters[key];
        if (content && content.length > 0) {
          const filterContent = key + '=' + content.join(',');
          filterParameters.push(filterContent);
        }

      });
    }
    return filterParameters.join('&');
  }

  private getPaginationQuery(page: Page) {
    let query = 'page=' + page.number;
    if (page.size) {
      query += '&size=' + page.size;
    }
    return query;
  }

  getPaginatedProjectsWithFilters(
    page: number,
    tpn: string,
    markerSymbols: string[],
    intentions: string[],
    assignmentStatuses: string[],
    workUnits: string[],
    privacies: string[]) {
    const queryParameters = this.buildFilterQueryParameters(tpn, markerSymbols, intentions, assignmentStatuses, workUnits, privacies);
    const url = this.apiServiceUrl + '/api/projects?page=' + page + queryParameters;
    return this.http.get<Project[]>(url);
  }

  buildFilterQueryParameters(
    tpn: string,
    markerSymbols: string[],
    intentions: string[],
    assignmentStatuses: string[],
    workUnits: string[],
    privacies: string[]) {

    let markerSymbolsAsParameter = '';
    let intentionsAsParameter = '';
    let assignmentStatusesAsParameter = '';
    let workUnitsAsParameter = '';
    let privaciesAsParameter = '';

    let tpnFilter = '';
    if (tpn) {
      tpnFilter = 'tpn=' + tpn.toUpperCase();
    }

    if (markerSymbols.length > 0) {
      markerSymbolsAsParameter = markerSymbols.map(x => 'markerSymbol=' + x).filter(x => x).join('&');
    }

    if (intentions.length > 0) {
      intentionsAsParameter = intentions.map(x => 'intention=' + x).filter(x => x).join('&');
    }

    if (assignmentStatuses.length > 0) {
      assignmentStatusesAsParameter = assignmentStatuses.map(x => 'status=' + x).filter(x => x).join('&');
    }

    if (workUnits.length > 0) {
      workUnitsAsParameter = workUnits.map(x => 'workUnitName=' + x).join('&');
    }

    if (privacies.length > 0) {
      privaciesAsParameter = privacies.map(x => 'privacyName=' + x).join('&');
    }

    let queryParameters = '';
    if (tpnFilter !== '') {
      queryParameters += '&' + tpnFilter;
    }
    if (markerSymbolsAsParameter !== '') {
      queryParameters += '&' + markerSymbolsAsParameter;
    }
    if (intentionsAsParameter !== '') {
      queryParameters += '&' + intentionsAsParameter;
    }
    if (assignmentStatusesAsParameter !== '') {
      queryParameters += '&' + assignmentStatusesAsParameter;
    }
    if (workUnitsAsParameter !== '') {
      queryParameters += '&' + workUnitsAsParameter;
    }
    if (privaciesAsParameter !== '') {
      queryParameters += '&' + privaciesAsParameter;
    }
    return queryParameters;
  }

  /**
   * Gets the history of the changes for a project.
   * @param tpn The identifier for the project.
   */
  getHistoryByTpn(tpn: string) {
    return this.http.get<ChangesHistory[]>(this.apiServiceUrl + '/api/projects/' + tpn + '/history');
  }
}
