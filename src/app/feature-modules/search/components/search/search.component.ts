import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { WorkUnit, WorkGroup, ConfigurationData, ConfigurationDataService } from 'src/app/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SearchService, Search } from '../..';
import { SearchBuilder } from '../../services/search.builder';
import { SearchResult } from '../../model/search.result';
import { InformativeDialogComponent } from 'src/app/shared/components/informative-dialog/informative-dialog.component';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  selectedSearchType: string = null;

  dataSource: SearchResult[];

  displayedColumns: string[] = ['Search term', 'Project summary', 'Allele Intentions', 'Gene Symbol / Location',
    'Project Assignment'];
  selectAllWorkUnits = true;
  panelOpenState = false;
  searchForm: FormGroup;
  searchControl = new FormControl();
  page: any = {};
  workUnits: WorkUnit[] = [];
  workGroups: WorkGroup[] = [];
  searchTypes: string[] = [];
  masterSelected: boolean;
  checkedList: any;
  myTextarea: string;
  configurationData: ConfigurationData;

  error;
  isLoading = true;
  isRateLimitReached = false;

  constructor(
    private formBuilder: FormBuilder,
    private searchService: SearchService,
    private configurationDataService: ConfigurationDataService,
    public dialog: MatDialog) { }

  ngOnInit() {
    
    this.searchForm = this.formBuilder.group({
      geneSymbol: ['']
    });

    this.configurationDataService.getConfigurationData().subscribe(data => {
      this.configurationData = data;
      this.initFiltersValues();
    });
    
    this.isLoading = true;
    this.getPage(0);
  }

  initFiltersValues(): void {
    this.searchTypes = this.configurationData.searchTypes.map(x => {
      return x
    });
    this.workUnits = this.configurationData.workUnits.map(x => {
      const workUnit: WorkUnit = new WorkUnit();
      workUnit.name = x;
      workUnit["isSelected"] = true;
      return workUnit
    });
    this.workGroups = this.configurationData.workGroups.map(x => {
      const workGroup: WorkGroup = new WorkGroup();
      workGroup.name = x;
      workGroup["isSelected"] = true;
      return workGroup
    });
  }

  public getPage(pageNumber: number): void {
    const geneSymbols = this.getGeneSymbolsAsArray();
    const workUnitsNames = this.getWorkUnitFilter();
    console.log('workUnitsNames', workUnitsNames);
    
    const searchType = this.getSearchType();
    this.isLoading = true;

    const search: Search = SearchBuilder.getInstance()
      .withSearchType(searchType)
      .withInputs(geneSymbols)
      .withWorkUnitsNames(workUnitsNames)
      .build();
    this.searchService.search(search, pageNumber).subscribe(data => 
      {
        this.dataSource = data['results'];
        this.refreshVisibleColumns();
        console.log(' this.dataSource:',  this.dataSource);
        
        this.page = data['page'];
        this.error = '';
        this.isLoading = false;
      }, error => {
        this.error = error;
        this.isLoading = false;
      });
  }

  private refreshVisibleColumns(): void {
    if (this.getGeneSymbolsAsArray().length == 0) {
      this.displayedColumns = ['Project summary', 'Allele Intentions', 'Gene Symbol / Location',
          'Project Assignment'];
    } else {
      this.displayedColumns = ['Search term', 'Project summary', 'Allele Intentions', 'Gene Symbol / Location',
          'Project Assignment'];
    }
  }

  private getSearchType(): string {
    return this.selectedSearchType;
  }

  private getWorkUnitFilter(): string[] {
    const workUnitSelectAll = document.querySelector("#workUnitsSelectAll") as HTMLInputElement;
    let selectedWorkUnits = [];
    if (!workUnitSelectAll.checked) {
      selectedWorkUnits = this.workUnits.filter(x => x["isSelected"]).map(element => element.name);
    }
    return selectedWorkUnits;
  }

  private getWorkGroupFilter(): string[] {
    const workGroupSelectAll = document.querySelector("#workGroupsSelectAll") as HTMLInputElement;
    let selectedWorkGroups = [];
    if (!workGroupSelectAll.checked) {
      selectedWorkGroups = this.workGroups.filter(x => x["isSelected"]).map(element => element.name);
    }
    return selectedWorkGroups;
  }

  getGeneSymbolsAsArray(): string[] {
    if (this.searchForm.get('geneSymbol').value) {
      const input: string = this.searchForm.get('geneSymbol').value;
      const geneSymbols = input.split(',');
      geneSymbols.map(x => x.trim());
      return geneSymbols;
    }
    return [];
  }

  checkUncheckWorkUnits(e) {
    for (const workUnit of this.workUnits) {
      const selector = '#' + this.getIdFromWorkUnitName(workUnit.name);
      const htmlElement = document.querySelector(selector) as HTMLInputElement;
      htmlElement.checked = e.target.checked;
      workUnit["isSelected"] = e.target.checked;
    }
  }

  checkUncheckWorkGroups(e) {
    for (const workGroup of this.workGroups) {
      const selector = '#' + this.getIdFromWorkGroupName(workGroup.name);
      const htmlElement = document.querySelector(selector) as HTMLInputElement;
      htmlElement.checked = e.target.checked;
      workGroup["isSelected"] = e.target.checked;
    }
  }

  onCheckedWorkUnitElement(element: any) {
    const isSelected = !element["isSelected"]
    element["isSelected"] = isSelected;
    const workUnitSelectAll = document.querySelector("#workUnitsSelectAll") as HTMLInputElement;
    workUnitSelectAll.checked = this.workUnits.filter(x => x["isSelected"]).length === this.workUnits.length;

    return isSelected;
  }

  onCheckedWorkGroupElement(element: any) {
    const isSelected = !element["isSelected"]
    element["isSelected"] = isSelected;
    const workGroupSelectAll = document.querySelector("#workGroupsSelectAll") as HTMLInputElement;
    workGroupSelectAll.checked = this.workGroups.filter(x => x["isSelected"]).length === this.workGroups.length;

    return isSelected;
  }

  onSubmit(e) {
    if (this.validSearch()) {
      this.getPage(0);
    }
  }

  private validSearch(): boolean {
    let isValid = true
    const input = this.getGeneSymbolsAsArray();
    if (input.length > 0) {
      if (!this.selectedSearchType) {
        const dialogRef = this.dialog.open(InformativeDialogComponent, {
          width: '250px',
          data: {
            title: 'Please select a search type',
            text: 'As you have defined an input for the search (' + input + '), you need to stablish a search type.'}
        });
    
        dialogRef.afterClosed().subscribe(result => {
          isValid = false;
        });
      }
      else {
        isValid = true;
      }
    }
    return isValid;
  }

  getIdFromWorkUnitName(workUnitName: string) {
    return 'workUnit_' + workUnitName.replace(/\W/g, '_');
  }

  getIdFromWorkGroupName(workGroupName: string) {
    return 'workGroup_' + workGroupName.replace(/\W/g, '_');
  }

}