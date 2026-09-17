//DCMM NOM ICONE DANS LA TABLE
ALTER TABLE "point_type"
ADD "icone" character varying(50) NULL;
UPDATE "point_type" SET "icone" = 'triangle_a33.10' WHERE "id_point_type" = '3';
UPDATE "point_type" SET "icone" = 'cabane' WHERE "id_point_type" = '7';
UPDATE "point_type" SET "icone" = 'cabane_green' WHERE "id_point_type" = '9';
UPDATE "point_type" SET "icone" = 'cabane_red' WHERE "id_point_type" = '10';
UPDATE "point_type" SET "icone" = 'pointdeau' WHERE "id_point_type" = '23';
UPDATE "point_type" SET "icone" = 'cabane_white_black_a63' WHERE "id_point_type" = '28';
UPDATE "point_type" SET "icone" = 'arc_lightgrey_black_manqueunmur' WHERE "id_point_type" = '29';
