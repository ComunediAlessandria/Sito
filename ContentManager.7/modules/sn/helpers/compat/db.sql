CREATE TABLE `snAnnotations` (
  `IDAnnotation` int(11) NOT NULL auto_increment,
  `IDOwner` int(11) NOT NULL default '-1',
  `IDEntity` int(11) default NULL,
  `IDAccess` tinyint(4) NOT NULL default '-1',
  `aType` varchar(20) default NULL,
  `ValueL` text,
  `TSCreate` int(11) default NULL,
  `Deleted` tinyint(4) NOT NULL default '0',
  PRIMARY KEY  (`IDAnnotation`),
  KEY `IDEntity` (`IDEntity`)
) ENGINE=MyISAM AUTO_INCREMENT=261 DEFAULT CHARSET=latin1

CREATE TABLE `snEntity` (
  `IDEntity` int(11) NOT NULL auto_increment,
  `eType` varchar(20) default NULL,
  `eSubtype` varchar(20) default NULL,
  `IDOwner` int(11) NOT NULL default '-1',
  `IDAccess` tinyint(4) NOT NULL default '-1',
  `TSCreate` int(11) default NULL,
  `TSUpdate` int(11) default NULL,
  `Deleted` tinyint(4) NOT NULL default '0',
  PRIMARY KEY  (`IDEntity`),
  KEY `type` (`eType`,`eSubtype`),
  KEY `IDOwner` (`IDOwner`)
) ENGINE=MyISAM AUTO_INCREMENT=343 DEFAULT CHARSET=latin1

CREATE TABLE `snMetadata` (
  `IDMetadata` int(11) NOT NULL auto_increment,
  `IDEntity` int(11) default NULL,
  `IDAccess` tinyint(4) NOT NULL default '-1',
  `Name` tinyint(4) default NULL,
  `ValueN` int(11) default NULL,
  `ValueT` varchar(100) default NULL,
  `ValueL` text,
  `ValueD` date default NULL,
  `Deleted` tinyint(4) NOT NULL default '0',
  PRIMARY KEY  (`IDMetadata`),
  KEY `IDEntity` (`IDEntity`),
  KEY `NameValueN` (`Name`,`ValueN`),
  KEY `NameValueT` (`Name`,`ValueT`)
) ENGINE=MyISAM AUTO_INCREMENT=1760 DEFAULT CHARSET=latin1

CREATE TABLE `snRelations` (
  `IDRelation` int(11) NOT NULL auto_increment,
  `IDUser` int(11) NOT NULL default '-1',
  `IDOther` int(11) NOT NULL default '-1',
  `Relation` varchar(100) default NULL,
  `TSCreate` int(11) default NULL,
  `Deleted` tinyint(4) NOT NULL default '0',
  PRIMARY KEY  (`IDRelation`),
  KEY `IDUserRelation` (`IDUser`,`Relation`)
) ENGINE=MyISAM AUTO_INCREMENT=147 DEFAULT CHARSET=latin1