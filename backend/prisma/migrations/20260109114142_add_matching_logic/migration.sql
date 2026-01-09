-- CreateTable
CREATE TABLE "likes" (
    "id" SERIAL NOT NULL,
    "from_pet_id" INTEGER NOT NULL,
    "to_pet_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "likes_from_pet_id_to_pet_id_key" ON "likes"("from_pet_id", "to_pet_id");

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_from_pet_id_fkey" FOREIGN KEY ("from_pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_to_pet_id_fkey" FOREIGN KEY ("to_pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
