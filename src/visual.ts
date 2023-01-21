/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;
    private logElement: HTMLElement;
    private host: powerbi.extensibility.visual.IVisualHost;
    private fetchMoreTimer: number;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.host = options.host;
        this.target = options.element;
        this.updateCount = 0;
        if (typeof document !== "undefined") {
            const new_p: HTMLElement = document.createElement("p");
            new_p.appendChild(document.createTextNode("Update count:"));
            const new_em: HTMLElement = document.createElement("em");
            this.textNode = document.createTextNode(this.updateCount.toString());
            new_em.appendChild(this.textNode);
            new_p.appendChild(new_em);
            this.target.appendChild(new_p);

            this.logElement = document.createElement('div');
            this.target.appendChild(this.logElement);
        }
    }

    public log(message: string) {
        console.log(message);
        this.logElement.innerText = message + '\n' + this.logElement.innerText;
    }

    public clearLog() {
        this.logElement.innerText = '';
    }

    public static getHierarchyCount(hierarchy: powerbi.DataViewHierarchy) {
        const { root } = hierarchy;
        let count = [0, 0];

        if (!hierarchy) {
            return count;
        }

        const getHierCount = (element: any) => {
            if (element.children) {
                element.children.map(i => getHierCount(i));
            }
            if (element.value && !element.children) {
                count[0] += 1;
            }
            if (element.isSubtotal) {
                count[1] += 1;
            }
        }

        getHierCount(hierarchy.root);

        return count;

    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Data reduction settings', this.settings.dataReductionCustomization);
        console.log('Dataview', options?.dataViews[0]?.matrix);
        if (typeof this.textNode !== "undefined") {
            this.textNode.textContent = (this.updateCount++).toString();
        }

        clearTimeout(this.fetchMoreTimer);
        const dataView = options && options.dataViews && options.dataViews[0];
        const rowCount = Visual.getHierarchyCount(dataView?.matrix.rows);
        const colCount = Visual.getHierarchyCount(dataView?.matrix.columns);

        this.clearLog();

        if (!dataView) {
            this.log('no dataview');
        } else if (!dataView.matrix) {
            this.log('no dataview matrix');
        } else {
            let doneFetching = true;
            if (dataView.metadata.segment) {
                this.log('calling fetchMoreData');
                doneFetching = !this.host.fetchMoreData();
            }
            if (doneFetching) {
                this.log(`done fetching - row count is ${rowCount} and total is ${rowCount[0] + rowCount[1]}`);
                this.log(`done fetching - col count is ${colCount} and total is ${colCount[0] + colCount[1]}`);
            } else {
                this.log(`done fetching - row count is ${rowCount} and total is ${rowCount[0] + rowCount[1]}`);
                this.log(`done fetching - col count is ${colCount} and  total is ${colCount[0] + colCount[1]}`);
                this.fetchMoreTimer = window.setTimeout(() => {
                    this.log('fetchMoreTimeout');
                }, 5000);
            }
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView) as VisualSettings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}