/* -*- js-indent-level: 8 -*- */
/*
 * L.Control.NotebookbarDraw
 */

/* global _ _UNO */
L.Control.NotebookbarDraw = L.Control.NotebookbarImpress.extend({

	getShortcutsBarData: function() {
		return [
			{
				'id': 'shortcutstoolbox',
				'type': 'toolbox',
				'children': [
					{
						'id': 'menu',
						'type': 'toolitem',
						'text': _('Menu'),
						'command': '.uno:Menubar'
					},
					{
						'id': 'save',
						'type': 'toolitem',
						'text': _('Save'),
						'command': '.uno:Save'
					},
					{
						'id': 'fullscreen',
						'type': 'toolitem',
						'text': _UNO('.uno:FullScreen'),
						'command': '.uno:FullScreen'
					},
					{
						'id': 'undo',
						'type': 'toolitem',
						'text': _('Undo'),
						'command': '.uno:Undo'
					},
					{
						'id': 'redo',
						'type': 'toolitem',
						'text': _('Redo'),
						'command': '.uno:Redo'
					}
				]
			}
		];
	},

	getOptionsSectionData: function() {
		return [
			{
				'id': 'optionscontainer',
				'type': 'container',
				'vertical': 'true',
				'children': [
					{
						'id': 'optionstoolboxdown',
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _('Page layout'),
								'command': '.uno:ModifyPage'
							},
							{
								'type': 'toolitem',
							}
						]
					}
				]
			}
		];
	},

	getTabs: function() {
		return [
			{
				'text': _('~File'),
				'id': '-1',
				'name': 'File',
			},
			{
				'text': _('~Home'),
				'id': this.HOME_TAB_ID,
				'name': 'Home',
				'context': 'default|DrawText'
			},
			{
				'text': _('~Insert'),
				'id': '-4',
				'name': 'Insert'
			},
			{
				'text': _('Format'),
				'id': '-3',
				'name': 'Format',
			},
			{
				'text': _('~Draw'),
				'id': '-11',
				'name': 'Draw',
				'context': 'Draw'
			},
			{
				'text': _('~Help'),
				'id': '-2',
				'name': 'Help',
			}
		];
	},

	getFullJSON: function(selectedId) {
		return this.getNotebookbar(
			[
				this.getFileTab(),
				this.getHomeTab(),
				this.getInsertTab(),
				this.getFormatTab(),
				this.getDrawTab(),
				this.getHelpTab()
			], selectedId);
	},

	getFileTab: function() {
		var hasRevisionHistory = L.Params.revHistoryEnabled;
		var hasPrint = !this._map['wopi'].HidePrintOption;
		var hasSaveAs = !this._map['wopi'].UserCanNotWriteRelative;
		var hasShare = this._map['wopi'].EnableShare;

		var content = [
			hasSaveAs ?
			{
				'id': 'file-saveas',
				'type': 'bigtoolitem',
				'text': _UNO('.uno:SaveAs', 'presentation'),
				'command': '.uno:SaveAs'
			} : {},
			{
				'id': 'file-shareas-rev-history',
				'type': 'container',
				'children': [
					hasShare ?
					{
						'id': 'shareas',
						'type': 'menubartoolitem',
						'text': _('Share'),
						'command': '.uno:shareas'
					} : {},
					hasRevisionHistory ?
					{
						'id': 'rev-history',
						'type': 'menubartoolitem',
						'text': _('See history'),
						'command': '.uno:rev-history'
					} : {},
				],
				'vertical': 'true'
			},
			hasPrint ?
			{
				'id': 'print',
				'type': 'bigtoolitem',
				'text': _UNO('.uno:Print', 'presentation'),
				'command': '.uno:Print'
			} : {},
			{
				'id': 'file-downloadas-odg-downloadas-png',
				'type': 'container',
				'children': [
					{
						'id': 'downloadas-odg',
						'type': 'menubartoolitem',
						'text': _('ODF Drawing (.odg)'),
						'command': ''
					},
					{
						'id': 'downloadas-png',
						'type': 'menubartoolitem',
						'text': _('Image (.png)'),
						'command': ''
					},
				],
				'vertical': 'true'
			},
			{
				'id': 'file-downloadas-pdf',
				'type': 'container',
				'children': [
					{
						'id': 'downloadas-pdf',
						'type': 'menubartoolitem',
						'text': _('PDF Document (.pdf)'),
						'command': ''
					}
				],
				'vertical': 'true'
			}
		];

		return this.getTabPage('File', content);
	},

	getHomeTab: function() {
		var content = [
			{
				'type': 'bigtoolitem',
				'text': _UNO('.uno:Paste'),
				'command': '.uno:Paste'
			},
			{
				'type': 'container',
				'children': [
					{
						'id': 'LineA6',
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:Cut'),
								'command': '.uno:Cut'
							}
						]
					},
					{
						'id': 'LineB7',
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:Copy'),
								'command': '.uno:Copy'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:FormatPaintbrush'),
								'command': '.uno:FormatPaintbrush'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:SetDefault'),
								'command': '.uno:SetDefault'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'container',
						'children': [
							{
								'id': 'fontnamecombobox',
								'type': 'combobox',
								'text': 'Carlito',
								'entries': [
									'Carlito'
								],
								'selectedCount': '1',
								'selectedEntries': [
									'0'
								],
								'command': '.uno:CharFontName'
							},
							{
								'id': 'fontsize',
								'type': 'combobox',
								'text': '12 pt',
								'entries': [
									'12 pt'
								],
								'selectedCount': '1',
								'selectedEntries': [
									'0'
								],
								'command': '.uno:FontHeight'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:Grow'),
								'command': '.uno:Grow'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:Shrink'),
								'command': '.uno:Shrink'
							}
						],
						'vertical': 'false'
					},
					{
						'type': 'container',
						'children': [
							{
								'id': 'ExtTop4',
								'type': 'toolbox',
								'children': [
									{
										'type': 'toolitem',
										'text': _UNO('.uno:Bold'),
										'command': '.uno:Bold'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:Italic'),
										'command': '.uno:Italic'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:Underline'),
										'command': '.uno:Underline'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:Strikeout'),
										'command': '.uno:Strikeout'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:Shadowed'),
										'command': '.uno:Shadowed'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:FontworkGalleryFloater'),
										'command': '.uno:FontworkGalleryFloater'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:CharBackColor'),
										'command': '.uno:CharBackColor'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:Color'),
										'command': '.uno:Color'
									}
								]
							}
						],
						'vertical': 'false'
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'container',
						'children': [
							{
								'type': 'toolbox',
								'children': [
									{
										'type': 'toolitem',
										'text': _UNO('.uno:CellVertTop'),
										'command': '.uno:CellVertTop'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:CellVertCenter'),
										'command': '.uno:CellVertCenter'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:CellVertBottom'),
										'command': '.uno:CellVertBottom'
									}
								]
							},
						],
						'vertical': 'false'
					},
					{
						'type': 'container',
						'children': [
							{
								'id': 'SectionBottom13',
								'type': 'toolbox',
								'children': [
									{
										'type': 'toolitem',
										'text': _UNO('.uno:LeftPara'),
										'command': '.uno:LeftPara'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:CenterPara'),
										'command': '.uno:CenterPara'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:RightPara'),
										'command': '.uno:RightPara'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:JustifyPara'),
										'command': '.uno:JustifyPara'
									}
								]
							},
						],
						'vertical': 'false'
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'container',
						'children': [
							{
								'type': 'toolbox',
								'children': [
									{
										'type': 'toolitem',
										'text': _UNO('.uno:DefaultBullet'),
										'command': '.uno:DefaultBullet'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:DefaultNumbering'),
										'command': '.uno:DefaultNumbering'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:IncrementIndent'),
										'command': '.uno:IncrementIndent'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:DecrementIndent'),
										'command': '.uno:DecrementIndent'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:ParaLeftToRight'),
										'command': '.uno:ParaLeftToRight'
									}
								]
							},
						],
						'vertical': 'false'
					},
					{
						'type': 'container',
						'children': [
							{
								'id': 'SectionBottom13',
								'type': 'toolbox',
								'children': [
									{
										'type': 'toolitem',
										'text': _UNO('.uno:ParaspaceIncrease'),
										'command': '.uno:ParaspaceIncrease'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:ParaspaceDecrease'),
										'command': '.uno:ParaspaceDecrease'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:LineSpacing'),
										'command': '.uno:LineSpacing'
									},
									{
										'type': 'toolitem',
										'text': _UNO('.uno:ParaRightToLeft'),
										'command': '.uno:ParaRightToLeft'
									}
								]
							},
						],
						'vertical': 'false'
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'bigtoolitem',
				'text': _UNO('.uno:Text'),
				'command': '.uno:Text'
			},
			{
				'type': 'container',
				'children': [
					{
						'id': 'LineA6',
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:BasicShapes'),
								'command': '.uno:BasicShapes'
							}
						]
					},
					{
						'id': 'LineB7',
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:ConnectorToolbox', 'presentation'),
								'command': '.uno:ConnectorToolbox'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:XLineColor'),
								'command': '.uno:XLineColor'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:FillColor'),
								'command': '.uno:FillColor'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertGraphic'),
								'command': '.uno:InsertGraphic'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertPage', 'presentation'),
								'command': '.uno:InsertPage'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:DuplicatePage', 'presentation'),
								'command': '.uno:DuplicatePage'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertObjectChart'),
								'command': '.uno:InsertObjectChart'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertTable', 'presentation'),
								'command': '.uno:InsertTable'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'bigtoolitem',
				'text': _UNO('.uno:SearchDialog'),
				'command': '.uno:SearchDialog'
			}
		];

		return this.getTabPage('Home', content);
	}

	getInsertTab: function() {
		var content = [
			{
				'type': 'bigtoolitem',
				'text': _UNO('.uno:InsertPage', 'presentation'),
				'command': '.uno:InsertPage'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:DuplicatePage', 'presentation'),
								'command': '.uno:DuplicatePage'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:DeletePage', 'presentation'),
								'command': '.uno:DeletePage'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'bigtoolitem',
				'text': _UNO('.uno:InsertGraphic'),
				'command': '.uno:InsertGraphic'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertTable', 'presentation'),
								'command': '.uno:InsertTable'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertObjectChart', 'presentation'),
								'command': '.uno:InsertObjectChart'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'bigtoolitem',
				'text': _UNO('.uno:HyperlinkDialog'),
				'command': '.uno:HyperlinkDialog'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertDateFieldFix', 'presentation'),
								'command': '.uno:InsertDateFieldFix'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertDateFieldVar', 'presentation'),
								'command': '.uno:InsertDateFieldVar'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertSlideField', 'presentation'),
								'command': '.uno:InsertSlideField'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertSlidesField', 'presentation'),
								'command': '.uno:InsertSlidesField'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertTimeFieldFix', 'presentation'),
								'command': '.uno:InsertTimeFieldFix'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertTimeFieldVar', 'presentation'),
								'command': '.uno:InsertTimeFieldVar'
							},
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertSlideTitleField', 'presentation'),
								'command': '.uno:InsertSlideTitleField'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'bigtoolitem',
				'text': _UNO('.uno:Text'),
				'command': '.uno:Text'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:BasicShapes'),
								'command': '.uno:BasicShapes'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:Line', 'presentation'),
								'command': '.uno:Line'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:FontworkGalleryFloater'),
								'command': '.uno:FontworkGalleryFloater'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:VerticalText', 'presentation'),
								'command': '.uno:VerticalText'
							}
						]
					}
				],
				'vertical': 'true'
			},
			{
				'type': 'container',
				'children': [
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:CharmapControl'),
								'command': '.uno:CharmapControl'
							}
						]
					},
					{
						'type': 'toolbox',
						'children': [
							{
								'type': 'toolitem',
								'text': _UNO('.uno:InsertAnnotation', 'text'),
								'command': '.uno:InsertAnnotation'
							}
						]
					}
				],
				'vertical': 'true'
			}
		];

		return this.getTabPage('Insert', content);
	},

});

L.control.notebookbarDraw = function (options) {
	return new L.Control.NotebookbarDraw(options);
};
