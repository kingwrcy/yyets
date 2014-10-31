CREATE TABLE IF NOT EXISTS "films"(
	id integer primary key,
	title text,
	channel text,
	category text,
	productCompany text,
	area text,
	language text,
	firstTime text,
	enName text,
	enOtherName text,
	officalWebsite text,
	filmDesc text,
	imgsrc text,
	link text
);


CREATE TABLE IF NOT EXISTS "films_link"(
	id integer primary key,
	filmId integer,
	link text,
	linkType text,
	filmSize text
);


CREATE TABLE IF NOT EXISTS "films_link_address"(
	id integer primary key,
	filmsLinkId integer,
	filmId integer,
	link text,
	linkType text
);
